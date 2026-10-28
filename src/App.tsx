import React, { useState } from 'react';
import { RevaloraProvider, useRevalora } from './context/RevaloraContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { HouseholdDashboard } from './components/household/HouseholdDashboard';
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PriceIntelligenceCard } from './components/pricing/PriceIntelligenceCard';
import { CommunityPoolingHub } from './components/pooling/CommunityPoolingHub';
import { TransactionsHistoryView } from './components/transactions/TransactionsHistoryView';
import { SustainabilityImpactView } from './components/sustainability/SustainabilityImpactView';
import { CreateListingModal } from './components/listings/CreateListingModal';
import { ReceiptModal } from './components/transactions/ReceiptModal';
import { AuthModal } from './components/auth/AuthModal';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { useSupabaseAuth } from './context/useSupabaseAuth';
import type { MaterialCategory, TransactionRecord } from './types';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import {
  Recycle,
} from 'lucide-react';

type ConnectionTestStatus =
  | { kind: 'success'; message: string }
  | { kind: 'failure'; message: string }
  | null;

const SupabaseConnectionTest: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<ConnectionTestStatus>(null);

  const testConnection = async () => {
    if (!isSupabaseConfigured) {
      setStatus({
        kind: 'failure',
        message: 'Supabase is not configured. Check the required frontend environment variables.',
      });
      return;
    }

    setIsTesting(true);
    setStatus(null);

    try {
      const { error } = await supabase
        .from('material_benchmarks')
        .select('category')
        .limit(1);

      if (error) {
        setStatus({
          kind: 'failure',
          message: 'Connection test failed. Check your Supabase settings, network, and table read access.',
        });
      } else {
        setStatus({
          kind: 'success',
          message: 'Connected. The read-only benchmark query succeeded.',
        });
      }
    } catch {
      setStatus({
        kind: 'failure',
        message: 'Connection test could not reach Supabase. Check your network and frontend settings.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row">
      <button
        type="button"
        onClick={testConnection}
        disabled={isTesting}
        className="rounded-lg border border-emerald-200 px-3 py-2 font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isTesting ? 'Testing Supabase...' : 'Test Supabase connection'}
      </button>
      {status && (
        <p
          role="status"
          aria-live="polite"
          className={status.kind === 'success' ? 'text-emerald-700' : 'text-rose-700'}
        >
          {status.message}
        </p>
      )}
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const { currentRole, setCurrentRole } = useRevalora();
  const { user, profile, isLoading: isAuthLoading, profileError, retryProfile, signOut } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCreateListingOpen, setIsCreateListingOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preselectedCategory, setPreselectedCategory] = useState<MaterialCategory | undefined>(undefined);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);
  const [listingRefreshToken, setListingRefreshToken] = useState(0);

  React.useEffect(() => {
    if (profile) {
      setCurrentRole(profile.role);
    } else if (!user && !isAuthLoading) {
      setCurrentRole('household');
    }
  }, [profile, user, isAuthLoading, setCurrentRole]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <p role="status" className="rounded-xl bg-white px-5 py-4 text-sm font-medium text-emerald-900 shadow-sm">
          Restoring your REVALORA session...
        </p>
      </div>
    );
  }

  if (profileError || (user && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="text-xl font-bold text-emerald-950">We could not load your account</h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-rose-800">
            {profileError || 'Your authenticated profile could not be verified.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={retryProfile}
              className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profile && currentRole !== profile.role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8f4] px-4">
        <p role="status" className="rounded-xl bg-white px-5 py-4 text-sm font-medium text-emerald-900 shadow-sm">
          Loading your account view...
        </p>
      </div>
    );
  }

  const handleOpenCreateWithCategory = (category: MaterialCategory) => {
    setPreselectedCategory(category);
    setIsCreateListingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#202b25] flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      <ToastContainer />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenCreateListing={() => {
          setPreselectedCategory(undefined);
          setIsCreateListingOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Render content based on activeTab */}
        {activeTab === 'dashboard' && (
          <>
            {currentRole === 'household' && (
              <HouseholdDashboard
                onOpenCreateListing={() => {
                  setPreselectedCategory(undefined);
                  setIsCreateListingOpen(true);
                }}
                onNavigateToPools={() => setActiveTab('pools')}
                onViewReceipt={(txn) => setSelectedReceipt(txn)}
                listingsRefreshToken={listingRefreshToken}
              />
            )}

            {currentRole === 'coordinator' && (
              <div className="space-y-6">
                <CommunityPoolingHub
                  onOpenCreateListing={() => setIsCreateListingOpen(true)}
                />
              </div>
            )}

            {currentRole === 'vendor' && <VendorDashboard />}

            {currentRole === 'admin' && <AdminDashboard />}
          </>
        )}

        {activeTab === 'prices' && (
          <PriceIntelligenceCard onQuickList={handleOpenCreateWithCategory} />
        )}

        {activeTab === 'pools' && (
          <CommunityPoolingHub
            onOpenCreateListing={() => {
              setPreselectedCategory(undefined);
              setIsCreateListingOpen(true);
            }}
          />
        )}

        {activeTab === 'logistics' && <VendorDashboard />}

        {activeTab === 'transactions' && <TransactionsHistoryView />}

        {activeTab === 'sustainability' && <SustainabilityImpactView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-100 bg-white/80 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Recycle className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">REVALORA</span>
            <span className="text-slate-300">|</span>
            <span>Every Resource Has Value &bull; Hackathon MVP</span>
          </div>

          <div className="flex items-center gap-4 text-center sm:text-right">
            <span>Simulated Benchmark Data &bull; Local Mandi Indicative Sample</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="text-emerald-800 font-medium">Built with React, TypeScript & Tailwind</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-5 flex justify-center border-t border-emerald-50 pt-5">
          <SupabaseConnectionTest />
        </div>
      </footer>

      {/* Modals */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        preselectedCategory={preselectedCategory}
        onListingCreated={() => setListingRefreshToken((token) => token + 1)}
      />

      <ReceiptModal
        transaction={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <RevaloraProvider>
      <SupabaseAuthProvider>
        <MainAppContent />
      </SupabaseAuthProvider>
    </RevaloraProvider>
  );
}
