import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseAuthContext } from './authContext';
import type { AuthProfile } from './authContext';

const isUserRole = (role: unknown): role is UserRole =>
  role === 'household' || role === 'coordinator' || role === 'vendor' || role === 'admin';

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadSessionUser = async (sessionUser: User | null) => {
      const currentRequest = ++requestId;
      setUser(sessionUser);
      setProfile(null);
      setProfileError(null);
      setIsLoading(true);

      if (!sessionUser) {
        setIsLoading(false);
        return;
      }

      if (!isSupabaseConfigured) {
        setProfileError('Supabase is not configured. Add the required frontend settings and reload.');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (error) {
          throw new Error('Could not load your account profile. Check your profile setup and try again.');
        }
        if (!data || !isUserRole(data.role)) {
          throw new Error('Your account profile is missing or has an unsupported role. Contact support.');
        }

        let vendorVerified: boolean | null = null;
        if (data.role === 'vendor') {
          const { data: vendorProfile, error: vendorError } = await supabase
            .from('vendor_profiles')
            .select('verified')
            .eq('id', sessionUser.id)
            .maybeSingle();

          if (vendorError || !vendorProfile) {
            throw new Error('Could not verify your vendor account details. Please try again.');
          }
          vendorVerified = vendorProfile.verified;
        }

        if (active && currentRequest === requestId) {
          setProfile({
            fullName: data.full_name,
            role: data.role,
            vendorVerified,
          });
        }
      } catch (error) {
        if (active && currentRequest === requestId) {
          setProfileError(
            error instanceof Error
              ? error.message
              : 'Could not load your account profile. Please try again.'
          );
        }
      } finally {
        if (active && currentRequest === requestId) {
          setIsLoading(false);
        }
      }
    };

    if (!isSupabaseConfigured) {
      return () => {
        active = false;
        requestId += 1;
      };
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadSessionUser(session?.user ?? null);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setProfileError('Could not restore your sign-in session. Reload the page or sign in again.');
        setIsLoading(false);
        return;
      }
      void loadSessionUser(data.session?.user ?? null);
    }).catch(() => {
      if (active) {
        setProfileError('Could not restore your sign-in session. Reload the page or sign in again.');
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
      requestId += 1;
      authListener.subscription.unsubscribe();
    };
  }, [retryCount]);

  const retryProfile = useCallback(() => {
    setRetryCount((count) => count + 1);
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return error ? 'Could not sign out. Please try again.' : null;
    } catch {
      return 'Could not sign out because of a network error. Please try again.';
    }
  }, []);

  const value = useMemo(
    () => ({ user, profile, isLoading, profileError, retryProfile, signOut }),
    [user, profile, isLoading, profileError, retryProfile, signOut]
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};
