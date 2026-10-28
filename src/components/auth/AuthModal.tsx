import React, { useState } from 'react';
import { Eye, EyeOff, Leaf, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type AuthMode = 'sign-in' | 'sign-up';
type SignupRole = 'household' | 'vendor';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getAuthErrorMessage = (message: string): string => {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials') || normalized.includes('invalid credentials')) {
    return 'Email or password is incorrect. Check your details and try again.';
  }
  if (normalized.includes('already registered') || normalized.includes('user_already_exists')) {
    return 'An account with this email may already exist. Try signing in instead.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please confirm your email using the link we sent before signing in.';
  }
  if (normalized.includes('password should be') || normalized.includes('at least')) {
    return 'Choose a longer password and try again.';
  }
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Too many attempts. Wait a little while before trying again.';
  }
  return message || 'Authentication failed. Please try again.';
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [role, setRole] = useState<SignupRole>('household');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [locality, setLocality] = useState('');
  const [society, setSociety] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isSigningUp = mode === 'sign-up';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!isSupabaseConfigured) {
      setMessage({
        kind: 'error',
        text: 'Supabase is not configured. Add the required frontend settings and reload the app.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSigningUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim() || null,
              locality: locality.trim(),
              society: society.trim(),
              role,
              ...(role === 'vendor' ? { business_name: businessName.trim() } : {}),
            },
          },
        });

        if (error) {
          setMessage({ kind: 'error', text: getAuthErrorMessage(error.message) });
          return;
        }

        if (data.user?.identities?.length === 0) {
          setMessage({
            kind: 'error',
            text: 'An account with this email may already exist. Try signing in instead.',
          });
          return;
        }

        if (data.session) {
          onClose();
        } else {
          setMessage({
            kind: 'success',
            text: 'Account created. Check your email for a confirmation link, then sign in.',
          });
          setMode('sign-in');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setMessage({ kind: 'error', text: getAuthErrorMessage(error.message) });
          return;
        }
        onClose();
      }
    } catch {
      setMessage({
        kind: 'error',
        text: 'Could not reach Supabase. Check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-emerald-100 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-xl font-bold text-emerald-950">
                {isSigningUp ? 'Create your REVALORA account' : 'Welcome back'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {isSigningUp ? 'Join as a household or scrap vendor.' : 'Sign in to your account.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close sign-in dialog"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          {isSigningUp && (
            <>
              <label className="block text-sm font-medium text-slate-700">
                Account type
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as SignupRole)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="household">Household</option>
                  <option value="vendor">Scrap vendor (verification required)</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  maxLength={120}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              {role === 'vendor' && (
                <label className="block text-sm font-medium text-slate-700">
                  Business name
                  <input
                    required
                    autoComplete="organization"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    maxLength={160}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Locality
                  <input
                    autoComplete="address-level2"
                    value={locality}
                    onChange={(event) => setLocality(event.target.value)}
                    maxLength={120}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Society / community
                  <input
                    value={society}
                    onChange={(event) => setSociety(event.target.value)}
                    maxLength={120}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Phone (optional)
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  maxLength={40}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <span className="relative mt-1.5 block">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
            {isSigningUp && <span className="mt-1 block text-xs text-slate-500">At least 6 characters.</span>}
          </label>

          {isSigningUp && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-900">
              Your profile is created by Supabase when you register. Vendor accounts start unverified;
              admins must approve them. Admin and coordinator roles cannot be selected here.
            </p>
          )}

          {message && (
            <p
              role={message.kind === 'error' ? 'alert' : 'status'}
              className={`rounded-lg px-3 py-2 text-sm ${
                message.kind === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isSupabaseConfigured}
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Please wait...'
              : isSigningUp
                ? 'Create account'
                : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-600">
            {isSigningUp ? 'Already have an account?' : 'New to REVALORA?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(isSigningUp ? 'sign-in' : 'sign-up');
                setMessage(null);
              }}
              className="font-semibold text-emerald-800 hover:text-emerald-950"
            >
              {isSigningUp ? 'Sign in' : 'Create an account'}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
};
