import React from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { ScrapListing } from '../../types';
import {
  X,
  Star,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface OfferComparisonModalProps {
  listing: ScrapListing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfferComparisonModal: React.FC<OfferComparisonModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { offers, acceptOffer, benchmarks } = useRevalora();

  if (!isOpen || !listing) return null;

  // Filter offers for this listing
  const relevantOffers = offers.filter(
    (o) => o.targetId === listing.id && (o.status === 'pending' || o.status === 'accepted')
  );

  // Find highest paying offer
  const highestProjected = Math.max(
    ...relevantOffers.map((o) => o.projectedTotal),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-5 bg-emerald-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Competitive Bidding
              </span>
              <h3 className="text-base font-bold text-white">
                Compare Vendor Offers
              </h3>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              For: {listing.totalEstimatedWeightKg} kg scrap ({listing.items.map((i) => i.category).join(', ')}) • Benchmark: ₹{Math.round(listing.estimatedEarnings)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {relevantOffers.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-bold text-slate-900">Waiting for Local Vendor Bids</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your listing has been broadcast to verified recyclers in {listing.locality}. Switch to the <strong>Scrap Vendor perspective</strong> in the top bar to simulate submitting competitive offers!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-100">
                <span>{relevantOffers.length} Verified Vendor Quote(s) Received</span>
                <span className="text-emerald-700 font-semibold">
                  Transparent Rate & Payout Guarantee
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantOffers.map((offer) => {
                  const isBest = offer.projectedTotal === highestProjected && relevantOffers.length > 1;
                  const isAccepted = offer.status === 'accepted';

                  return (
                    <div
                      key={offer.id}
                      className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                        isAccepted
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/30'
                          : isBest
                          ? 'border-emerald-400 bg-white shadow-md'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Best Offer Ribbon */}
                      {isBest && !isAccepted && (
                        <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                          <Award className="w-3 h-3" />
                          <span>HIGHEST PROJECTED PAYOUT</span>
                        </div>
                      )}

                      {isAccepted && (
                        <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-800 text-white text-[10px] font-bold shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>OFFER ACCEPTED & SCHEDULED</span>
                        </div>
                      )}

                      <div>
                        {/* Vendor info */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {offer.vendorName}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                {offer.vendorRating}
                              </span>
                              <span className="text-[11px] text-slate-400">• Verified Recycler</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 uppercase">Payout</span>
                            <p className="text-xl font-black text-emerald-950">
                              ₹{offer.projectedTotal}
                            </p>
                          </div>
                        </div>

                        {/* Benchmark Difference Pill */}
                        <div className="mb-3">
                          {offer.benchmarkDiffPercent > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <TrendingUp className="w-3 h-3" />
                              +{offer.benchmarkDiffPercent}% above benchmark reference rate
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                              At local reference benchmark
                            </span>
                          )}
                        </div>

                        {/* Rates table */}
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs mb-3">
                          <p className="text-[10px] uppercase font-bold text-slate-400">
                            Vendor Quoted Rates per kg:
                          </p>
                          {listing.items.map((item) => {
                            const quotedRate = offer.ratesPerKg[item.category] || 0;
                            const bench = benchmarks.find((b) => b.category === item.category);

                            return (
                              <div
                                key={item.category}
                                className="flex items-center justify-between text-[11px]"
                              >
                                <span className="capitalize text-slate-700">
                                  {item.category} ({item.estimatedWeightKg} kg)
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">
                                    ₹{quotedRate}/kg
                                  </span>
                                  {bench && (
                                    <span className="text-slate-400 text-[10px]">
                                      (Ref: ₹{bench.referenceRatePerKg})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Proposed pickup window */}
                        <div className="space-y-1 text-xs text-slate-600 mb-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{offer.proposedPickupDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{offer.proposedTimeSlot}</span>
                          </div>
                          {offer.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-100/60 p-2 rounded-lg">
                              &ldquo;{offer.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <div>
                        {isAccepted ? (
                          <div className="w-full py-2.5 text-center text-xs font-bold text-emerald-800 bg-emerald-100 rounded-xl">
                            Pickup Confirmed
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              acceptOffer(offer.id);
                              onClose();
                            }}
                            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
                              isBest
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            Accept Offer & Schedule Pickup
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
