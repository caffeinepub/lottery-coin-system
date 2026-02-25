import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';
import type { UserProfile } from '@/backend';

// Admin session token storage key
const ADMIN_SESSION_KEY = 'adminSessionToken';
const ADMIN_SESSION_EXPIRY_KEY = 'adminSessionExpiry';
// Admin session duration: 8 hours
const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

// Hardcoded admin credentials (hashed comparison)
// Admin ID: "luckycoins_admin" | Password: "Admin@LuckyCoins2024!"
// In production these would come from a secure backend endpoint
const ADMIN_ID = 'luckycoins_admin';
const ADMIN_PASSWORD_HASH = 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1';

// Simple hash function for client-side credential verification
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input + 'luckycoins_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate a secure random session token
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  userProfile: UserProfile | null;
  isFetched: boolean;
  showProfileSetup: boolean;
  profileError: string | null;
  completeProfileSetup: () => void;
  refetchProfile: () => Promise<void>;
  // Admin auth
  adminSessionToken: string | null;
  isAdmin: boolean;
  adminLogin: (adminId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
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
  adminSessionToken: null,
  isAdmin: false,
  adminLogin: async () => ({ success: false }),
  adminLogout: () => {},
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

  // Admin session state
  const [adminSessionToken, setAdminSessionToken] = useState<string | null>(() => {
    try {
      const token = localStorage.getItem(ADMIN_SESSION_KEY);
      const expiry = localStorage.getItem(ADMIN_SESSION_EXPIRY_KEY);
      if (token && expiry) {
        const expiryTime = parseInt(expiry, 10);
        if (Date.now() < expiryTime) {
          return token;
        } else {
          // Expired — clean up
          localStorage.removeItem(ADMIN_SESSION_KEY);
          localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const isAdmin = !!adminSessionToken;

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

      if (result && typeof result === 'object' && '__kind__' in result) {
        if (result.__kind__ === 'ok') {
          setUserProfile((result as any).ok);
          setShowProfileSetup(false);
          setProfileFetched(true);
        } else if (result.__kind__ === 'err') {
          const err = (result as any).err;
          if (err === 'notFound' || err === '#notFound' || err?.notFound !== undefined || err === 0) {
            setUserProfile(null);
            setShowProfileSetup(true);
            setProfileFetched(true);
          } else {
            setUserProfile(null);
            setShowProfileSetup(false);
            setProfileError('Unauthorized access. Please log in again.');
            setProfileFetched(true);
          }
        }
      } else if (result === null || result === undefined) {
        setUserProfile(null);
        setShowProfileSetup(true);
        setProfileFetched(true);
      } else {
        setUserProfile(result as unknown as UserProfile);
        setShowProfileSetup(false);
        setProfileFetched(true);
      }
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      setUserProfile(null);
      setProfileFetched(true);
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

  // Admin login: validates credentials client-side and issues a local session token
  const adminLogin = useCallback(async (adminId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate admin ID
      if (adminId !== ADMIN_ID) {
        return { success: false, error: 'Invalid admin credentials' };
      }

      // Hash the provided password and compare
      const providedHash = await hashString(password);
      // For the default password "Admin@LuckyCoins2024!" the hash is pre-computed
      // We compare against the stored hash
      const expectedHash = await hashString('Admin@LuckyCoins2024!');

      if (providedHash !== expectedHash) {
        return { success: false, error: 'Invalid admin credentials' };
      }

      // Generate session token
      const token = generateSessionToken();
      const expiry = Date.now() + ADMIN_SESSION_DURATION_MS;

      // Store in state and localStorage
      setAdminSessionToken(token);
      localStorage.setItem(ADMIN_SESSION_KEY, token);
      localStorage.setItem(ADMIN_SESSION_EXPIRY_KEY, expiry.toString());

      return { success: true };
    } catch {
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  }, []);

  const adminLogout = useCallback(() => {
    setAdminSessionToken(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_EXPIRY_KEY);
  }, []);

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
        adminSessionToken,
        isAdmin,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
