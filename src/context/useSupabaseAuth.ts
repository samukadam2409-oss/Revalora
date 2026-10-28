import { useContext } from 'react';
import { SupabaseAuthContext } from './authContext';

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider.');
  }
  return context;
};
