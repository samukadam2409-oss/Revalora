import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { TransactionRecord } from '../../types';
import {
  X,
  CheckCircle2,
  Leaf,
  Star,
  Printer,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: TransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { currentRole, addTransactionRating } = useRevalora();

  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [hasSubmittedRating, setHasSubmittedRating] = useState<boolean>(false);

  if (!isOpen || !transaction) return null;

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const party = currentRole === 'vendor' ? 'vendor' : 'household';
    addTransactionRating(transaction.id, party, stars, comment);
    setHasSubmittedRating(true);
  };

  const existingRating =
    currentRole === 'vendor'
      ? transaction.ratings?.byVendor
      : transaction.ratings?.byHousehold;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Receipt Header */}
        <div className="px-6 py-5 bg-emerald-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official Receipt
              </span>
              <h3 className="text-base font-bold text-white">{transaction.receiptNumber}</h3>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              REVALORA Digital Scrap Exchange & Payout Certificate
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-800">
          {/* Parties & Timestamp */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Seller (Household)
              </p>
              <p className="font-bold text-slate-900 text-sm">{transaction.householdName}</p>
              <p className="text-slate-500 mt-0.5">{transaction.society}</p>
              <p className="text-slate-500">{transaction.locality}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Buyer (Recycler)
              </p>
              <p className="font-bold text-slate-900 text-sm">{transaction.vendorName}</p>
              <p className="text-emerald-700 font-medium mt-0.5">Verified Scrap Collector</p>
              <p className="text-slate-500">
                {new Date(transaction.completedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Measured Items Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Measured Breakdown & Payout
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Material</th>
                    <th className="p-2.5 text-center">Scale Weight</th>
                    <th className="p-2.5 text-center">Agreed Rate</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transaction.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-medium capitalize text-slate-800">
                        {item.category}
                      </td>
                      <td className="p-2.5 text-center font-semibold">
                        {item.measuredWeightKg} kg
                      </td>
                      <td className="p-2.5 text-center">₹{item.ratePerKg}/kg</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₹{item.subtotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-emerald-50 text-emerald-950 font-bold border-t border-emerald-200">
                  <tr>
                    <td className="p-3">Total Payout</td>
                    <td className="p-3 text-center">
                      {transaction.totalMeasuredWeightKg} kg
                    </td>
                    <td className="p-3 text-center text-slate-400 font-normal text-[11px]">
                      (Scale Verified)
                    </td>
                    <td className="p-3 text-right text-base font-extrabold text-emerald-950">
                      ₹{transaction.totalPayout}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Dual-Confirmation Status */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Verification Status:</span>
              <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800">
                {transaction.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Vendor Signed
              </span>
              <span className="flex items-center gap-1">
                {transaction.householdConfirmed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                )}
                Household {transaction.householdConfirmed ? 'Signed' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Environmental Impact Certificate */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-emerald-950 text-xs">
                  Recycling Impact Certificate
                </p>
                <p className="text-[11px] text-emerald-800">
                  Prevented ~{(transaction.totalMeasuredWeightKg * 1.3).toFixed(1)} kg CO₂ emissions & diverted {transaction.totalMeasuredWeightKg} kg from landfill
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase bg-white px-2 py-1 rounded border border-emerald-200 shrink-0">
              Verified Circular
            </span>
          </div>

          {/* Reviews & Ratings Section (SRS FR-REV-01 to 03) */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Rate Transaction & Vendor
            </h4>

            {existingRating || hasSubmittedRating ? (
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: existingRating?.stars || stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 italic">
                  &ldquo;{existingRating?.comment || comment || 'Fast and professional service.'}&rdquo;
                </p>
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStars(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= stars
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Share quick feedback on weighing accuracy or promptness..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
