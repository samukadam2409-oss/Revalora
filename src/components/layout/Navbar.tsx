import React from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { UserRole } from '../../types';
import {
  Recycle,
  Users,
  Truck,
  ShieldCheck,
  Home,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Receipt,
  Layers,
  Leaf,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateListing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateListing,
}) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    currentVendor,
    metrics,
    resetAllDemoData,
  } = useRevalora();

  const roleOptions: { role: UserRole; label: string; icon: React.ReactNode; subtitle: string }[] = [
    {
      role: 'household',
      label: 'Household View',
      icon: <Home className="w-4 h-4" />,
      subtitle: currentUser.name,
    },
    {
      role: 'coordinator',
      label: 'Society Lead',
      icon: <Users className="w-4 h-4" />,
      subtitle: 'Rajesh Nair',
    },
    {
      role: 'vendor',
      label: 'Scrap Vendor',
      icon: <Truck className="w-4 h-4" />,
      subtitle: currentVendor.businessName,
    },
    {
      role: 'admin',
      label: 'Admin Desk',
      icon: <ShieldCheck className="w-4 h-4" />,
      subtitle: 'Price & Policy Control',
    },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'prices', label: 'Price Benchmark', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'pools', label: 'Community Pools', icon: <Layers className="w-4 h-4" /> },
    { id: 'logistics', label: 'Pickups & Logistics', icon: <Truck className="w-4 h-4" /> },
    { id: 'transactions', label: 'Receipts & History', icon: <Receipt className="w-4 h-4" /> },
    { id: 'sustainability', label: 'Impact Metrics', icon: <Leaf className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Demo Bar & Role Switcher */}
      <div className="bg-emerald-950 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider text-[10px] border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Hackathon Demo Mode
          </span>
          <span className="hidden sm:inline text-emerald-300/80">|</span>
          <span className="hidden sm:inline text-slate-300">
            Switch perspective to test end-to-end user journeys:
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <div className="flex items-center bg-emerald-900/60 p-0.5 rounded-lg border border-emerald-800">
            {roleOptions.map((opt) => {
              const active = currentRole === opt.role;
              return (
                <button
                  key={opt.role}
                  onClick={() => setCurrentRole(opt.role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-emerald-500 text-emerald-950 font-bold shadow-xs'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/50'
                  }`}
                  title={`${opt.label}: ${opt.subtitle}`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset all demo listings, offers and pools to default seed data?')) {
                resetAllDemoData();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/80 text-emerald-300 hover:text-white border border-emerald-800/70 transition-colors"
            title="Reset data for demo judges"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-emerald-950">
                  REVALORA
                </span>
                <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Circular Scrap MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-normal hidden sm:block">
                Every Resource Has Value
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge for Judges */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                <strong>{metrics.totalScrapRecycledKg} kg</strong> recycled
              </span>
            </div>
            <span className="text-emerald-300">•</span>
            <div className="text-emerald-800 font-medium">
              <strong>{metrics.totalCo2SavedKg} kg</strong> CO₂ diverted
            </div>
          </div>

          {/* Action Button & Active Actor Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-emerald-950">
                {currentRole === 'household'
                  ? currentUser.name
                  : currentRole === 'coordinator'
                  ? 'Rajesh Nair (Lead)'
                  : currentRole === 'vendor'
                  ? currentVendor.businessName
                  : 'System Administrator'}
              </p>
              <p className="text-[11px] text-slate-500">
                {currentRole === 'household' || currentRole === 'coordinator'
                  ? currentUser.society
                  : currentRole === 'vendor'
                  ? 'Verified Recycler ★ 4.9'
                  : 'Policy & Rate Hub'}
              </p>
            </div>

            {currentRole === 'household' && (
              <button
                onClick={onOpenCreateListing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-md shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5"
              >
                <Recycle className="w-4 h-4" />
                <span>List Scrap</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-100/80 text-emerald-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

