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
  completeProfileSetup: () => void;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  userProfile: null,
  isFetched: false,
  showProfileSetup: false,
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

  const isAuthenticated = !!identity;
  const isLoading = isInitializing || actorFetching || (isAuthenticated && profileLoading && !profileFetched);

  const fetchProfile = useCallback(async () => {
    if (!actor || !identity) {
      setUserProfile(null);
      setProfileFetched(false);
      return;
    }
    setProfileLoading(true);
    try {
      const profile = await actor.getCallerUserProfile();
      setUserProfile(profile);
      setProfileFetched(true);
      if (profile === null) {
        setShowProfileSetup(true);
      } else {
        setShowProfileSetup(false);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUserProfile(null);
      setProfileFetched(true);
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
        completeProfileSetup,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
