import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { CommunityPool } from '../../types';
import {
  Layers,
  Plus,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  X,
} from 'lucide-react';

interface CommunityPoolingHubProps {
  onOpenCreateListing: () => void;
}

export const CommunityPoolingHub: React.FC<CommunityPoolingHubProps> = ({
  onOpenCreateListing,
}) => {
  const {
    pools,
    listings,
    currentUser,
    currentRole,
    joinPool,
    leavePool,
    createPool,
    offers,
    acceptOffer,
  } = useRevalora();

  // Modal for joining pool
  const [selectedPoolForJoin, setSelectedPoolForJoin] = useState<CommunityPool | null>(null);
  const [selectedListingIdToAttach, setSelectedListingIdToAttach] = useState<string>('');

  // Modal for creating pool (for Coordinator or Admin)
  const [isCreatePoolOpen, setIsCreatePoolOpen] = useState<boolean>(false);
  const [newPoolName, setNewPoolName] = useState<string>('Greenwood Society Clean Earth Drive');
  const [targetPickupDate, setTargetPickupDate] = useState<string>('Next Saturday, Nov 01');
  const [minTotalWeightKg, setMinTotalWeightKg] = useState<number>(200);
  const [bonusRatePerKg, setBonusRatePerKg] = useState<number>(2.5);

  // Eligible open listings for current user
  const myOpenListings = listings.filter(
    (l) => l.householdId === currentUser.id && l.status === 'open'
  );

  const handleJoinSubmit = () => {
    if (!selectedPoolForJoin || !selectedListingIdToAttach) return;
    joinPool(selectedPoolForJoin.id, selectedListingIdToAttach);
    setSelectedPoolForJoin(null);
    setSelectedListingIdToAttach('');
  };

  const handleCreatePoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPool({
      name: newPoolName,
      targetPickupDate,
      minTotalWeightKg,
      bonusRatePerKg,
    });
    setIsCreatePoolOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Primary Innovation Banner (SRS Section 4.5) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Core Hackathon Innovation
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Community Scrap Pooling (Bulk Aggregation)
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Individual scrap sales yield small volumes and fragmented logistics. By aggregating recyclable waste within your apartment society or residential colony, community members unlock <strong>higher bulk vendor rates (+₹2.00–₹2.50/kg)</strong> and reduce neighborhood transport emissions with a single consolidated pickup.
          </p>

          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Higher bulk commercial payouts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero individual pickup hassle</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Reduced neighborhood carbon footprint</span>
            </div>
          </div>
        </div>

        {(currentRole === 'coordinator' || currentRole === 'admin') && (
          <div className="mt-4 sm:mt-0 sm:absolute sm:right-6 sm:bottom-6 z-10">
            <button
              onClick={() => setIsCreatePoolOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Society Pool</span>
            </button>
          </div>
        )}
      </div>

      {/* Available Pools Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Active Neighborhood Pools in {currentUser.locality}
            </h3>
            <p className="text-xs text-slate-500">
              Attach your listing to a pool to participate in collective vendor bidding
            </p>
          </div>

          {currentRole !== 'coordinator' && currentRole !== 'admin' && (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              Viewing as Resident ({currentUser.society})
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pools.map((pool) => {
            const progressPercent = Math.min(
              100,
              Math.round((pool.currentWeightKg / pool.minTotalWeightKg) * 100)
            );
            const poolListings = listings.filter((l) => pool.memberListingIds.includes(l.id));
            const isUserParticipating = poolListings.some((l) => l.householdId === currentUser.id);

            // Pool vendor bids
            const poolOffers = offers.filter(
              (o) => o.targetId === pool.id && (o.status === 'pending' || o.status === 'accepted')
            );

            return (
              <div
                key={pool.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-emerald-300 transition-all"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {pool.societyName}
                        </span>
                        {isUserParticipating && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            You Joined
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mt-1">
                        {pool.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Coordinator: {pool.coordinatorName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-200">
                        +{pool.bonusRatePerKg} ₹/kg Bonus
                      </span>
                    </div>
                  </div>

                  {/* Weight Progress Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Aggregated Weight: <strong>{pool.currentWeightKg} kg</strong>
                      </span>
                      <span className="text-slate-500 font-medium">
                        Target: {pool.minTotalWeightKg} kg ({progressPercent}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progressPercent >= 100
                            ? 'bg-emerald-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>{pool.memberListingIds.length} Participating Households</span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Target Collection: {pool.targetPickupDate}
                      </span>
                    </div>
                  </div>

                  {/* Member Listings List */}
                  {poolListings.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Joined Household Bundles:
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {poolListings.map((l) => (
                          <span
                            key={l.id}
                            className={`text-xs px-2.5 py-1 rounded-lg border ${
                              l.householdId === currentUser.id
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 font-medium'
                            }`}
                          >
                            {l.householdName}: {l.totalEstimatedWeightKg} kg (
                            {l.items.map((i) => i.category).join(', ')})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vendor Bids on Pool */}
                  {poolOffers.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          {poolOffers.length} Bulk Vendor Bid(s) Received
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Max Bid: ₹{Math.max(...poolOffers.map((o) => o.projectedTotal))}
                        </span>
                      </div>
                      {poolOffers.map((po) => (
                        <div
                          key={po.id}
                          className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-emerald-100"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{po.vendorName}</span>
                            <span className="text-slate-400 text-[10px] ml-1.5">
                              (★ {po.vendorRating})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-950">
                              ₹{po.projectedTotal}
                            </span>
                            {currentRole === 'coordinator' && po.status === 'pending' && (
                              <button
                                onClick={() => acceptOffer(po.id)}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700"
                              >
                                Accept for Society
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  {isUserParticipating ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Your scrap is pooled
                      </span>
                      <button
                        onClick={() => {
                          const userListingInPool = poolListings.find(
                            (l) => l.householdId === currentUser.id
                          );
                          if (userListingInPool) {
                            leavePool(pool.id, userListingInPool.id);
                          }
                        }}
                        className="text-xs text-amber-700 hover:text-amber-800 underline font-medium"
                      >
                        Withdraw Listing
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedPoolForJoin(pool)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Join Society Pool</span>
                    </button>
                  )}

                  <span className="text-[11px] text-slate-400">
                    Status: <strong className="capitalize text-slate-700">{pool.status}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Join Pool Modal */}
      {selectedPoolForJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Join Community Scrap Pool</h4>
                <p className="text-xs text-slate-500">{selectedPoolForJoin.name}</p>
              </div>
              <button
                onClick={() => setSelectedPoolForJoin(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {myOpenListings.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
                <h5 className="font-bold text-slate-900 text-sm">No Open Listings Available</h5>
                <p className="text-xs text-slate-500">
                  You need an open scrap listing to join this pool. Create a new listing first!
                </p>
                <button
                  onClick={() => {
                    setSelectedPoolForJoin(null);
                    onOpenCreateListing();
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Create Scrap Listing Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Select Your Scrap Listing to Pool:
                  </label>
                  <div className="space-y-2">
                    {myOpenListings.map((listing) => (
                      <label
                        key={listing.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedListingIdToAttach === listing.id
                            ? 'bg-emerald-50 border-emerald-500'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selected_listing"
                          value={listing.id}
                          checked={selectedListingIdToAttach === listing.id}
                          onChange={(e) => setSelectedListingIdToAttach(e.target.value)}
                          className="mt-0.5 accent-emerald-600"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-slate-900">
                            {listing.totalEstimatedWeightKg} kg Scrap (
                            {listing.items.map((i) => i.category).join(', ')})
                          </p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Est: ₹{Math.round(listing.estimatedEarnings)} • {listing.preferredPickupDate}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs">
                  🎉 By pooling, you will receive the <strong>+{selectedPoolForJoin.bonusRatePerKg} ₹/kg</strong> society bulk aggregation premium!
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPoolForJoin(null)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedListingIdToAttach}
                    onClick={handleJoinSubmit}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                  >
                    Confirm Join Pool
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Pool Modal */}
      {isCreatePoolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Launch Society Scrap Pool
                </h4>
                <p className="text-xs text-slate-500">
                  Coordinator Drive for {currentUser.society}
                </p>
              </div>
              <button
                onClick={() => setIsCreatePoolOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePoolSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pool Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    required
                    value={minTotalWeightKg}
                    onChange={(e) => setMinTotalWeightKg(parseInt(e.target.value) || 100)}
                    className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Bonus Rate (₹/kg)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={bonusRatePerKg}
                    onChange={(e) => setBonusRatePerKg(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Collection Date
                </label>
                <input
                  type="text"
                  required
                  value={targetPickupDate}
                  onChange={(e) => setTargetPickupDate(e.target.value)}
                  placeholder="e.g., Saturday, Nov 07"
                  className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatePoolOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Launch Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
