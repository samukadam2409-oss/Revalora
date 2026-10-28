import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../types';

export interface AuthProfile {
  fullName: string;
  role: UserRole;
  vendorVerified: boolean | null;
}

export interface SupabaseAuthContextValue {
  user: User | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  profileError: string | null;
  retryProfile: () => void;
  signOut: () => Promise<string | null>;
}

export const SupabaseAuthContext = createContext<SupabaseAuthContextValue | undefined>(undefined);
