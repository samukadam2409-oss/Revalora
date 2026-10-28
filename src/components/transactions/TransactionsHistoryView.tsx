import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { TransactionRecord } from '../../types';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const TransactionsHistoryView: React.FC = () => {
  const { transactions } = useRevalora();
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'disputed'>('all');

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'confirmed') return t.status === 'confirmed';
    if (filter === 'pending') return t.status === 'pending_confirmation';
    if (filter === 'disputed') return t.status === 'disputed';
    return true;
  });

  const totalDisbursed = transactions.reduce((sum, t) => sum + t.totalPayout, 0);
  const totalWeight = transactions.reduce((sum, t) => sum + t.totalMeasuredWeightKg, 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Total Value Settled
          </span>
          <p className="text-2xl font-black text-emerald-950 mt-1">
            ₹{totalDisbursed.toFixed(2)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            100% verified digital scale measurements
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Scrap Weighed & Diverted
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {totalWeight.toFixed(1)} <span className="text-sm font-semibold text-slate-400">kg</span>
          </p>
          <p className="text-[11px] text-blue-700 font-medium mt-0.5">
            Diverted from municipal landfills
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Digital Receipts Issued
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {transactions.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Dual party cryptographically logged
          </p>
        </div>
      </div>

      {/* Main Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              Verified Transaction Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Transparent digital receipts with exact rate × measured scale weights
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'confirmed' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'pending' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending Confirmation
            </button>
            <button
              onClick={() => setFilter('disputed')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filter === 'disputed' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
              }`}
            >
              Disputed
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Receipt className="w-8 h-8 mx-auto" />
            <p className="text-xs">No transactions matching this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((txn) => {
              const isConfirmed = txn.status === 'confirmed';
              const isDisputed = txn.status === 'disputed';

              return (
                <div
                  key={txn.id}
                  onClick={() => setSelectedReceipt(txn)}
                  className="p-5 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {txn.receiptNumber}
                      </span>
                      {isConfirmed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                        </span>
                      )}
                      {!isConfirmed && !isDisputed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Sign-off
                        </span>
                      )}
                      {isDisputed && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Disputed
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>{txn.householdName}</strong> &bull; Collector:{' '}
                      <span className="font-semibold text-slate-800">{txn.vendorName}</span>
                    </p>

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-0.5">
                      <span>Total Scale Weight: <strong>{txn.totalMeasuredWeightKg} kg</strong></span>
                      <span>&bull;</span>
                      <span>
                        Materials: {txn.items.map((i) => `${i.category} (${i.measuredWeightKg}kg)`).join(', ')}
                      </span>
                      {txn.variancePercentage !== 0 && (
                        <>
                          <span>&bull;</span>
                          <span className={Math.abs(txn.variancePercentage) > 20 ? 'text-amber-700 font-bold' : ''}>
                            Variance: {txn.variancePercentage >= 0 ? `+${txn.variancePercentage}` : txn.variancePercentage}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase">Settled Payout</span>
                      <p className="text-lg font-black text-emerald-950">
                        ₹{txn.totalPayout}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(txn.completedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceipt}
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
};
