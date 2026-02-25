import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';
import type { UserProfile } from '@/backend';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  isFetched: boolean;
  showProfileSetup: boolean;
  profileError: string | null;
  completeProfileSetup: () => void;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  userProfile: null,
  isFetched: false,
  showProfileSetup: false,
  profileError: null,
  completeProfileSetup: () => {},
  refetchProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || actorFetching || (isAuthenticated && profileLoading && !profileFetched);

  const fetchProfile = useCallback(async () => {
    if (!actor || !identity) {
      setUserProfile(null);
      setProfileFetched(false);
      setShowProfileSetup(false);
      setProfileError(null);
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const result = await actor.getCallerUserProfile();

      // Handle Result type: { __kind__: "ok", ok: UserProfile } | { __kind__: "err", err: ... }
      if (result && typeof result === 'object' && '__kind__' in result) {
        if (result.__kind__ === 'ok') {
          setUserProfile((result as any).ok);
          setShowProfileSetup(false);
          setProfileFetched(true);
        } else if (result.__kind__ === 'err') {
          const err = (result as any).err;
          if (err === 'notFound' || err === '#notFound' || err?.notFound !== undefined || err === 0) {
            // No profile yet — show setup modal
            setUserProfile(null);
            setShowProfileSetup(true);
            setProfileFetched(true);
          } else {
            // Unauthorized or other error
            setUserProfile(null);
            setShowProfileSetup(false);
            setProfileError('Unauthorized access. Please log in again.');
            setProfileFetched(true);
          }
        }
      } else if (result === null || result === undefined) {
        // Fallback: treat null as not found
        setUserProfile(null);
        setShowProfileSetup(true);
        setProfileFetched(true);
      } else {
        // Fallback: treat as direct UserProfile object (legacy)
        setUserProfile(result as unknown as UserProfile);
        setShowProfileSetup(false);
        setProfileFetched(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      setUserProfile(null);
      setProfileFetched(true);
      // Check if it's a "not found" trap from the backend
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('notfound')) {
        setShowProfileSetup(true);
      } else {
        setProfileError('Failed to load profile. Please try again.');
      }
    } finally {
      setProfileLoading(false);
    }
  }, [actor, identity]);

  useEffect(() => {
    if (actor && identity && !actorFetching) {
      fetchProfile();
    } else if (!identity) {
      setUserProfile(null);
      setProfileFetched(false);
      setShowProfileSetup(false);
      setProfileError(null);
    }
  }, [actor, identity, actorFetching]);

  const completeProfileSetup = useCallback(async () => {
    setShowProfileSetup(false);
    await fetchProfile();
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
  }, [fetchProfile, queryClient]);

  const refetchProfile = useCallback(async () => {
    await fetchProfile();
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
  }, [fetchProfile, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userProfile,
        isFetched: profileFetched,
        showProfileSetup,
        profileError,
        completeProfileSetup,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
