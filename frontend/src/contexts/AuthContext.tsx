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

// Default admin credentials:
// Admin ID: "admin" | Password: "admin123"
// The frontend hashes the provided password with SHA-256 (no salt) and compares
// it to the SHA-256 hash of the expected plaintext password using the same function.
const ADMIN_ID = 'admin';
const ADMIN_EXPECTED_PASSWORD = 'admin123';

// Hash function: SHA-256, no salt, lowercase hex output.
// Both the stored expected hash and the runtime hash use this same function,
// so the comparison is always consistent.
async function hashPassword(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
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

  // Admin session state — restored from localStorage on init if not expired
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

  // Admin login: validates credentials client-side using SHA-256 hashing (no salt).
  // The frontend hashes the provided password and compares it to the hash of the
  // expected plaintext password using the same hashPassword function — ensuring
  // the stored hash and runtime hash are always identical for the same input.
  // Default credentials: Admin ID = "admin", Password = "admin123"
  const adminLogin = useCallback(async (adminId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate admin ID (case-sensitive)
      if (adminId !== ADMIN_ID) {
        return { success: false, error: 'Invalid admin credentials' };
      }

      // Hash the provided password and the expected password using the same function,
      // then compare — this ensures consistency regardless of the stored hash value.
      const providedHash = await hashPassword(password);
      const expectedHash = await hashPassword(ADMIN_EXPECTED_PASSWORD);

      if (providedHash !== expectedHash) {
        return { success: false, error: 'Invalid admin credentials' };
      }

      // Generate session token and persist with expiry
      const token = generateSessionToken();
      const expiry = Date.now() + ADMIN_SESSION_DURATION_MS;

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
