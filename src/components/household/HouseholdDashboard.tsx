import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { ScrapListing, TransactionRecord } from '../../types';
import {
  Package,
  Layers,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Scale,
  Sparkles,
  MapPin,
  Calendar,
} from 'lucide-react';
import { OfferComparisonModal } from './OfferComparisonModal';
import { SupabaseListingsPanel } from '../listings/SupabaseListingsPanel';

interface HouseholdDashboardProps {
  onOpenCreateListing: () => void;
  onNavigateToPools: () => void;
  onViewReceipt: (txn: TransactionRecord) => void;
  listingsRefreshToken: number;
}

export const HouseholdDashboard: React.FC<HouseholdDashboardProps> = ({
  onOpenCreateListing,
  onNavigateToPools,
  onViewReceipt,
  listingsRefreshToken,
}) => {
  const {
    currentUser,
    listings,
    pools,
    offers,
    transactions,
    metrics,
    cancelListing,
    leavePool,
    confirmTransaction,
    disputeTransaction,
  } = useRevalora();

  const [selectedListingForOffers, setSelectedListingForOffers] = useState<ScrapListing | null>(null);

  // Household's own listings
  const myListings = listings.filter((l) => l.householdId === currentUser.id);

  // Pending transactions needing household confirmation
  const pendingConfirmations = transactions.filter(
    (t) => t.householdId === currentUser.id && t.status === 'pending_confirmation'
  );

  // Completed transactions for household
  const completedTxns = transactions.filter(
    (t) => t.householdId === currentUser.id && t.status === 'confirmed'
  );

  const activeCount = myListings.filter(
    (l) => l.status === 'open' || l.status === 'pooled' || l.status === 'scheduled'
  ).length;

  const totalEstEarnings = myListings
    .filter((l) => l.status === 'open' || l.status === 'pooled' || l.status === 'scheduled')
    .reduce((sum, l) => sum + l.estimatedEarnings, 0);

  const statusBadge = (status: ScrapListing['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Open for Bids
          </span>
        );
      case 'pooled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            In Society Pool
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            Pickup Scheduled
          </span>
        );
      case 'collected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            Weighed / In Review
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Confirmation Alerts (Dual-Confirmation SRS FR-TXN-03) */}
      {pendingConfirmations.length > 0 && (
        <div className="space-y-3">
          {pendingConfirmations.map((txn) => {
            const hasHighVariance = Math.abs(txn.variancePercentage) > 20;

            return (
              <div
                key={txn.id}
                className={`p-5 rounded-2xl border ${
                  hasHighVariance
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                } shadow-sm animate-in fade-in`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        hasHighVariance ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          Pickup Collection Completed — Confirmation Required
                        </span>
                        <span className="text-xs bg-white px-2 py-0.5 rounded-md font-semibold border">
                          Receipt: {txn.receiptNumber}
                        </span>
                      </div>
                      <p className="text-xs mt-1 leading-relaxed opacity-90">
                        {txn.vendorName} weighed a total of{' '}
                        <strong>{txn.totalMeasuredWeightKg} kg</strong> (Estimated:{' '}
                        {txn.totalEstimatedWeightKg} kg). Total calculated payout:{' '}
                        <strong className="text-sm">₹{txn.totalPayout}</strong>.
                      </p>

                      {hasHighVariance && (
                        <p className="text-xs text-amber-800 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Variance Alert: Measured weight differs by {txn.variancePercentage}% from your original estimate.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        const reason = window.prompt(
                          'Please specify the reason for dispute (e.g., incorrect weight scale reading, missing material item):'
                        );
                        if (reason) disputeTransaction(txn.id, reason);
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700"
                    >
                      Dispute Weight
                    </button>
                    <button
                      onClick={() => confirmTransaction(txn.id, 'household')}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      Confirm Payout & Sign Receipt
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending Scrap
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {myListings.reduce((sum, l) => (l.status !== 'completed' && l.status !== 'cancelled' ? sum + l.totalEstimatedWeightKg : sum), 0)}{' '}
            <span className="text-sm font-semibold text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {activeCount} active scrap request(s)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Est. Pending Return
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-2">
            ₹{Math.round(totalEstEarnings)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Calculated with Mandi benchmark rates
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Recycled to Date
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {metrics.totalScrapRecycledKg}{' '}
            <span className="text-sm font-semibold text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            {metrics.totalCo2SavedKg} kg carbon emissions prevented
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Society Pooling Bonus
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-950 mt-2">+₹2.00 / kg</p>
          <p className="text-[11px] text-purple-700 font-medium mt-1">
            Active in {currentUser.society}
          </p>
        </div>
      </div>

      <SupabaseListingsPanel refreshToken={listingsRefreshToken} />

      {/* Community Pooling Teaser Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              Core Hackathon Innovation
            </span>
            <h3 className="font-bold text-base">Community Scrap Pooling</h3>
          </div>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            Aggregate your household scrap with neighbors in {currentUser.society} to unlock bulk rates (+10% to +15% higher vendor payout) and save on neighborhood truck emissions.
          </p>
        </div>
        <button
          onClick={onNavigateToPools}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-950 text-xs font-bold hover:bg-emerald-50 shadow-xs transition-colors shrink-0"
        >
          <span>Explore Society Pools</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* My Scrap Listings Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Demo Listings (local preview)</h3>
            <p className="text-xs text-slate-500">
              These sample cards are local demo data. Use Live Scrap Listings above for Supabase records.
            </p>
          </div>
          <button
            onClick={onOpenCreateListing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>New Scrap Listing</span>
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900">No active scrap listings</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by listing paper, cardboard, plastics, or old appliances to receive competitive offers from local recyclers.
            </p>
            <button
              onClick={onOpenCreateListing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Create First Listing
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myListings.map((listing) => {
              const listingOffers = offers.filter(
                (o) => o.targetId === listing.id && (o.status === 'pending' || o.status === 'accepted')
              );
              const pool = listing.poolId ? pools.find((p) => p.id === listing.poolId) : null;

              return (
                <div key={listing.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {listing.totalEstimatedWeightKg} kg Recyclable Scrap
                        </span>
                        {statusBadge(listing.status)}
                        {pool && (
                          <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                            Joined: {pool.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {listing.society}, {listing.locality}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Prefers: {listing.preferredPickupDate} ({listing.timeSlot})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase">Est. Value</span>
                      <p className="text-lg font-black text-emerald-950">
                        ₹{Math.round(listing.estimatedEarnings)}
                      </p>
                    </div>
                  </div>

                  {/* Material line items pill list */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                      >
                        <span className="capitalize">{item.category}:</span>
                        <strong>{item.estimatedWeightKg} kg</strong>
                        <span className="text-slate-400 text-[10px]">
                          ({item.condition.replace('_', ' ')})
                        </span>
                      </span>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {listingOffers.length > 0 ? (
                        <button
                          onClick={() => setSelectedListingForOffers(listing)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Review {listingOffers.length} Vendor Offer(s)</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Awaiting quotes from local vendors
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {listing.status === 'open' && (
                        <button
                          onClick={onNavigateToPools}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          Join Society Pool
                        </button>
                      )}

                      {listing.status === 'pooled' && pool && (
                        <button
                          onClick={() => leavePool(pool.id, listing.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
                        >
                          Leave Pool
                        </button>
                      )}

                      {listing.status === 'open' && (
                        <button
                          onClick={() => cancelListing(listing.id)}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Receipts Quick Access */}
      {completedTxns.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">
              Past Collection Receipts ({completedTxns.length})
            </h4>
            <span className="text-xs text-slate-400">Click receipt to view breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedTxns.map((txn) => (
              <div
                key={txn.id}
                onClick={() => onViewReceipt(txn)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {txn.receiptNumber}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {txn.vendorName} &bull; {txn.totalMeasuredWeightKg} kg
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-950 text-sm">
                    ₹{txn.totalPayout}
                  </span>
                  <p className="text-[10px] text-emerald-700 font-medium">Receipt Verified</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offer Comparison Modal */}
      <OfferComparisonModal
        listing={selectedListingForOffers}
        isOpen={Boolean(selectedListingForOffers)}
        onClose={() => setSelectedListingForOffers(null)}
      />
    </div>
  );
};
