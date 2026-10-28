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
import type { MaterialCategory, TransactionRecord } from './types';
import {
  Recycle,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentRole } = useRevalora();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCreateListingOpen, setIsCreateListingOpen] = useState<boolean>(false);
  const [preselectedCategory, setPreselectedCategory] = useState<MaterialCategory | undefined>(undefined);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);

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
      </footer>

      {/* Modals */}
      <CreateListingModal
        isOpen={isCreateListingOpen}
        onClose={() => setIsCreateListingOpen(false)}
        preselectedCategory={preselectedCategory}
      />

      <ReceiptModal
        transaction={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <RevaloraProvider>
      <MainAppContent />
    </RevaloraProvider>
  );
}
