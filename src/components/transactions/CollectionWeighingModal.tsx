import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { PickupTask, MaterialCategory } from '../../types';
import {
  X,
  AlertTriangle,
} from 'lucide-react';

interface CollectionWeighingModalProps {
  pickup: PickupTask | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface WeighingFormProps {
  pickup: PickupTask;
  onClose: () => void;
  onComplete: () => void;
}

const WeighingForm: React.FC<WeighingFormProps> = ({
  pickup,
  onClose,
  onComplete,
}) => {
  const { listings, benchmarks, completeCollection } = useRevalora();

  const [measuredItems, setMeasuredItems] = useState<{
    category: MaterialCategory;
    measuredWeightKg: number;
    ratePerKg: number;
  }[]>(() => {
    const listing = pickup.listingId ? listings.find((l) => l.id === pickup.listingId) : null;
    if (listing) {
      return listing.items.map((i) => {
        const bench = benchmarks.find((b) => b.category === i.category);
        return {
          category: i.category,
          measuredWeightKg: i.estimatedWeightKg,
          ratePerKg: bench ? bench.referenceRatePerKg : 15,
        };
      });
    }
    return [
      { category: 'paper', measuredWeightKg: 15, ratePerKg: 15 },
      { category: 'cardboard', measuredWeightKg: 10, ratePerKg: 13 },
    ];
  });

  const handleWeightChange = (index: number, weight: number) => {
    setMeasuredItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], measuredWeightKg: Math.max(0, weight) };
      return updated;
    });
  };

  const handleRateChange = (index: number, rate: number) => {
    setMeasuredItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ratePerKg: Math.max(0, rate) };
      return updated;
    });
  };

  const totalMeasuredWeight = Number(
    measuredItems.reduce((acc, i) => acc + i.measuredWeightKg, 0).toFixed(1)
  );

  const totalPayout = Number(
    measuredItems
      .reduce((acc, i) => acc + i.measuredWeightKg * i.ratePerKg, 0)
      .toFixed(2)
  );

  const estimatedWeight = pickup.estimatedWeightKg || 1;
  const variancePercentage = Number(
    (((totalMeasuredWeight - estimatedWeight) / estimatedWeight) * 100).toFixed(1)
  );
  const hasHighVariance = Math.abs(variancePercentage) > 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeCollection({
      pickupId: pickup.id,
      measuredItems,
    });
    onComplete();
  };

  return (
    <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="px-6 py-5 bg-emerald-950 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              On-Site Digital Weighing
            </span>
            <h3 className="text-base font-bold text-white">Record Measured Weight</h3>
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            Stop: {pickup.targetTitle} • {pickup.addressText}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          Enter the exact weight recorded on the certified digital hanging or platform scale. Payout updates live according to agreed rates.
        </div>

        {/* Measured items table */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            <span className="col-span-5">Material Line</span>
            <span className="col-span-3 text-center">Scale Weight (kg)</span>
            <span className="col-span-2 text-center">Rate (₹/kg)</span>
            <span className="col-span-2 text-right">Subtotal</span>
          </div>

          {measuredItems.map((item, idx) => {
            const subtotal = Number((item.measuredWeightKg * item.ratePerKg).toFixed(2));

            return (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-slate-50 border border-slate-200"
              >
                <div className="col-span-5">
                  <span className="text-xs font-bold text-slate-900 capitalize">
                    {item.category}
                  </span>
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={item.measuredWeightKg}
                    onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-xs font-bold bg-white border border-slate-300 rounded-lg py-1.5 focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={item.ratePerKg}
                    onChange={(e) => handleRateChange(idx, parseFloat(e.target.value) || 0)}
                    className="w-full text-center text-xs font-bold bg-white border border-slate-300 rounded-lg py-1.5 focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-xs font-bold text-emerald-950">
                    ₹{subtotal}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Variance Warning (SRS FR-TXN-04) */}
        {hasHighVariance && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Significant Weight Variance Detected ({variancePercentage}%)</p>
              <p className="text-amber-800/90 mt-0.5 leading-relaxed">
                The measured weight differs by more than 20% from the estimated {pickup.estimatedWeightKg} kg. An alert notice will be displayed to the household during receipt confirmation.
              </p>
            </div>
          </div>
        )}

        {/* Payout Summary */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-emerald-900">
              Total Measured Weight
            </span>
            <p className="text-xl font-black text-emerald-950">
              {totalMeasuredWeight} kg
            </p>
            <p className="text-[11px] text-emerald-700">
              Est: {pickup.estimatedWeightKg} kg ({variancePercentage >= 0 ? `+${variancePercentage}` : variancePercentage}%)
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-medium text-emerald-900">
              Final Payout Amount
            </span>
            <p className="text-3xl font-black text-emerald-950">
              ₹{totalPayout}
            </p>
            <p className="text-[11px] text-emerald-700">
              Direct UPI / Cash Settlement
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
          >
            Generate Digital Receipt & Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export const CollectionWeighingModal: React.FC<CollectionWeighingModalProps> = ({
  pickup,
  isOpen,
  onClose,
  onComplete,
}) => {
  if (!isOpen || !pickup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <WeighingForm
        key={pickup.id}
        pickup={pickup}
        onClose={onClose}
        onComplete={onComplete}
      />
    </div>
  );
};
