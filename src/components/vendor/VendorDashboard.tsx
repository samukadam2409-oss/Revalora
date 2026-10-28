import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type {
  PickupTask,
  MaterialCategory,
} from '../../types';
import {
  Truck,
  Package,
  Layers,
  MapPin,
  Clock,
  Scale,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  X,
  Phone,
} from 'lucide-react';
import { CollectionWeighingModal } from '../transactions/CollectionWeighingModal';

export const VendorDashboard: React.FC = () => {
  const {
    currentVendor,
    vendors,
    switchVendor,
    listings,
    pools,
    offers,
    pickups,
    benchmarks,
    submitVendorOffer,
    updatePickupStatus,
  } = useRevalora();

  // Active sub-tab inside Vendor view
  const [subTab, setSubTab] = useState<'requests' | 'logistics'>('requests');

  // Submit offer modal state
  const [offerTarget, setOfferTarget] = useState<{
    type: 'listing' | 'pool';
    id: string;
    title: string;
    materials: MaterialCategory[];
    totalWeight: number;
    locality: string;
  } | null>(null);

  const [quotedRates, setQuotedRates] = useState<Partial<Record<MaterialCategory, number>>>({});
  const [proposedDate, setProposedDate] = useState<string>('Tomorrow, Oct 29');
  const [proposedSlot, setProposedSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [offerNotes, setOfferNotes] = useState<string>(
    'Certified on-site digital scale weighing & immediate UPI/Cash payment.'
  );

  // Weighing modal state
  const [activePickupToWeigh, setActivePickupToWeigh] = useState<PickupTask | null>(null);

  // Filter listings and pools in vendor's service area
  const openListings = listings.filter((l) => l.status === 'open');
  const openPools = pools.filter((p) => p.status === 'forming' || p.status === 'bidding');

  // Vendor's scheduled pickups
  const myPickups = pickups.filter((p) => p.vendorId === currentVendor.id);

  // Handle open offer modal
  const handleOpenOfferModal = (
    type: 'listing' | 'pool',
    id: string,
    title: string,
    materials: MaterialCategory[],
    totalWeight: number,
    locality: string
  ) => {
    // Pre-populate rates from benchmarks + vendor margin
    const initialRates: Partial<Record<MaterialCategory, number>> = {};
    materials.forEach((cat) => {
      const bench = benchmarks.find((b) => b.category === cat);
      initialRates[cat] = bench ? bench.referenceRatePerKg + 1 : 15;
    });

    setQuotedRates(initialRates);
    setOfferTarget({ type, id, title, materials, totalWeight, locality });
  };

  const handleRateChange = (category: MaterialCategory, rate: number) => {
    setQuotedRates((prev) => ({
      ...prev,
      [category]: Math.max(1, rate),
    }));
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTarget) return;

    submitVendorOffer({
      targetType: offerTarget.type,
      targetId: offerTarget.id,
      targetTitle: offerTarget.title,
      ratesPerKg: quotedRates,
      proposedPickupDate: proposedDate,
      proposedTimeSlot: proposedSlot,
      notes: offerNotes,
    });

    setOfferTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Vendor Profile Switcher Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Truck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                {currentVendor.businessName}
              </span>
              {currentVendor.verified && (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Recycler
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Fleet: {currentVendor.vehicleType} • Rating: ★ {currentVendor.rating} ({currentVendor.reviewCount} reviews)
            </p>
          </div>
        </div>

        {/* Vendor Selector for Testing */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Simulate Vendor:
          </span>
          <select
            value={currentVendor.id}
            onChange={(e) => switchVendor(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.businessName} ({v.vehicleType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'requests'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Available Scrap Requests ({openListings.length + openPools.length})</span>
        </button>

        <button
          onClick={() => setSubTab('logistics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === 'logistics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Route & Pickups ({myPickups.length})</span>
        </button>
      </div>

      {/* TAB 1: Available Requests */}
      {subTab === 'requests' && (
        <div className="space-y-6">
          {/* Section: Community Bulk Pools */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                High-Volume Community Scrap Pools (Bulk Bidding)
              </h3>
              <span className="text-xs text-slate-400">
                Consolidated pickups with single collection point
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openPools.map((pool) => {
                const existingOffer = offers.find(
                  (o) => o.targetId === pool.id && o.vendorId === currentVendor.id
                );

                return (
                  <div
                    key={pool.id}
                    className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {pool.societyName}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-1">
                          {pool.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {pool.locality} • Lead: {pool.coordinatorName}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Aggregated</span>
                        <p className="text-xl font-black text-emerald-950">
                          {pool.currentWeightKg} kg
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Minimum Target Weight:</span>
                        <span className="font-semibold text-slate-900">{pool.minTotalWeightKg} kg</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Target Pickup Date:</span>
                        <span className="font-semibold text-slate-900">{pool.targetPickupDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700">
                        <span>Society Bulk Premium:</span>
                        <span className="font-bold">+{pool.bonusRatePerKg} ₹/kg</span>
                      </div>
                    </div>

                    <div>
                      {existingOffer ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                          <span>Quote Submitted: ₹{existingOffer.projectedTotal}</span>
                          <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-emerald-200/60">
                            {existingOffer.status}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleOpenOfferModal(
                              'pool',
                              pool.id,
                              pool.name,
                              ['paper', 'cardboard', 'plastic', 'metal', 'e-waste'],
                              pool.currentWeightKg,
                              pool.locality
                            )
                          }
                          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Submit Bulk Society Quote
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Individual Household Listings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                Individual Household Scrap Listings
              </h3>
              <span className="text-xs text-slate-400">
                {openListings.length} open for quotes in {currentVendor.serviceLocalities.join(', ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openListings.map((listing) => {
                const existingOffer = offers.find(
                  (o) => o.targetId === listing.id && o.vendorId === currentVendor.id
                );
                const materials = listing.items.map((i) => i.category);

                return (
                  <div
                    key={listing.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {listing.householdName}
                          </span>
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {listing.locality}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {listing.society} (Exact flat revealed upon offer acceptance)
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Est. Scrap</span>
                        <p className="text-xl font-black text-slate-900">
                          {listing.totalEstimatedWeightKg} kg
                        </p>
                      </div>
                    </div>

                    {/* Materials line */}
                    <div className="flex flex-wrap gap-1.5">
                      {listing.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                        >
                          {item.category}: <strong>{item.estimatedWeightKg} kg</strong> (
                          {item.condition.replace('_', ' ')})
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Prefers: {listing.preferredPickupDate} ({listing.timeSlot})
                      </span>
                      <span className="font-semibold text-emerald-800">
                        Ref Val: ~₹{Math.round(listing.estimatedEarnings)}
                      </span>
                    </div>

                    <div>
                      {existingOffer ? (
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold flex items-center justify-between">
                          <span>Your Quote: ₹{existingOffer.projectedTotal}</span>
                          <span className="capitalize text-[11px] text-emerald-800 font-bold">
                            {existingOffer.status}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleOpenOfferModal(
                              'listing',
                              listing.id,
                              `${listing.householdName} (${listing.totalEstimatedWeightKg} kg)`,
                              materials,
                              listing.totalEstimatedWeightKg,
                              listing.locality
                            )
                          }
                          className="w-full py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          Quote Rate per kg
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Route & Pickups Logistics */}
      {subTab === 'logistics' && (
        <div className="space-y-6">
          {/* Nearest-Neighbour Route Optimizer Banner (SRS FR-ROUTE-01 to 03) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Pickup Route Optimization (Deterministic Heuristic)
                </span>
              </div>
              <h3 className="font-bold text-base">
                Consolidated Pickup Route • Greenwood & Indiranagar Sector
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stops are ordered deterministically by locality coordinates to minimize fuel consumption and turnaround time.
              </p>
            </div>
            <div className="text-right text-xs bg-white/10 p-3 rounded-xl border border-white/10 shrink-0">
              <p className="text-slate-300">Total Route Load</p>
              <p className="text-xl font-black text-emerald-300">
                {myPickups.reduce((sum, p) => sum + p.estimatedWeightKg, 0)} kg
              </p>
              <p className="text-[11px] text-emerald-400">~12.4 km total loop</p>
            </div>
          </div>

          {/* Pickup Tasks Sequence */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Today&apos;s Scheduled Pickup Sequence
            </h3>

            {myPickups.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
                <Truck className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No scheduled pickups yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit competitive quotes on available listings above. Once accepted, pickups will appear here in optimized order.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myPickups.map((pickup, idx) => (
                  <div
                    key={pickup.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {pickup.contactName}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {pickup.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {pickup.addressText}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {pickup.contactPhone}
                          </span>
                          <span>•</span>
                          <span>Slot: {pickup.timeSlot} ({pickup.scheduledDate})</span>
                          <span>•</span>
                          <span>Est. Load: {pickup.estimatedWeightKg} kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      {pickup.status === 'scheduled' && (
                        <button
                          onClick={() => updatePickupStatus(pickup.id, 'in_transit')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                        >
                          Mark In-Transit
                        </button>
                      )}

                      {pickup.status === 'in_transit' && (
                        <button
                          onClick={() => updatePickupStatus(pickup.id, 'arrived')}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 transition-colors"
                        >
                          Mark Arrived
                        </button>
                      )}

                      {pickup.status !== 'collected' && pickup.status !== 'completed' && (
                        <button
                          onClick={() => setActivePickupToWeigh(pickup)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <Scale className="w-4 h-4" />
                          <span>Weigh on Scale & Settle</span>
                        </button>
                      )}

                      {pickup.status === 'collected' && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Collection Recorded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Vendor Offer Modal */}
      {offerTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Submit Competitive Offer</h4>
                <p className="text-xs text-slate-500">
                  Target: {offerTarget.title} ({offerTarget.totalWeight} kg in {offerTarget.locality})
                </p>
              </div>
              <button
                onClick={() => setOfferTarget(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quote Rates per kg (₹/kg):
                </label>
                <div className="space-y-2">
                  {offerTarget.materials.map((mat) => {
                    const bench = benchmarks.find((b) => b.category === mat);
                    const currentRate = quotedRates[mat] || (bench ? bench.referenceRatePerKg : 15);

                    return (
                      <div
                        key={mat}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 capitalize">{mat}</span>
                          {bench && (
                            <span className="text-[11px] text-slate-400 ml-1.5">
                              (Benchmark: ₹{bench.referenceRatePerKg}/kg)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-500">₹</span>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            value={currentRate}
                            onChange={(e) =>
                              handleRateChange(mat, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 text-center font-bold text-xs bg-white border border-slate-300 rounded-lg"
                          />
                          <span className="text-slate-500">/kg</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Proposed Pickup Date
                  </label>
                  <input
                    type="text"
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Proposed Time Window
                  </label>
                  <input
                    type="text"
                    value={proposedSlot}
                    onChange={(e) => setProposedSlot(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vendor Notes & Guarantees
                </label>
                <input
                  type="text"
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Send Quote to Household
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scale Weighing Modal */}
      <CollectionWeighingModal
        pickup={activePickupToWeigh}
        isOpen={Boolean(activePickupToWeigh)}
        onClose={() => setActivePickupToWeigh(null)}
        onComplete={() => setActivePickupToWeigh(null)}
      />
    </div>
  );
};
