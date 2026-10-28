import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { MaterialCategory } from '../../types';
import {
  TrendingUp,
  Truck,
  AlertTriangle,
  Edit2,
  Save,
  RotateCcw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    benchmarks,
    updateBenchmarkRate,
    vendors,
    toggleVendorVerification,
    transactions,
    resetAllDemoData,
    confirmTransaction,
  } = useRevalora();

  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);
  const [newRate, setNewRate] = useState<number>(0);
  const [newSource, setNewSource] = useState<string>('');

  const disputedTransactions = transactions.filter((t) => t.status === 'disputed');

  const startEditRate = (category: MaterialCategory, currentRate: number, source: string) => {
    setEditingCategory(category);
    setNewRate(currentRate);
    setNewSource(source);
  };

  const handleSaveRate = (category: MaterialCategory) => {
    updateBenchmarkRate(category, newRate, newSource);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              Administrative Control Desk
            </span>
            <span className="text-xs text-slate-400">• Operational Authority</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            REVALORA Policy, Pricing & Verification Hub
          </h2>
          <p className="text-xs text-slate-300">
            Control indicative market benchmarks, verified recycler credentials, and dispute arbitrations.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Reset demo state to pristine seed data?')) {
              resetAllDemoData();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Ledger</span>
        </button>
      </div>

      {/* Benchmark Reference Rates Management */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Benchmark Reference Rate Curation (Live Market Policy)
            </h3>
            <p className="text-xs text-slate-500">
              Adjust indicative per-kg rates broadcast to households and vendors
            </p>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Reference Rate (₹/kg)</th>
                <th className="p-3">Source & Mandi Basis</th>
                <th className="p-3 text-center">Last Updated</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map((b) => {
                const isEditing = editingCategory === b.category;

                return (
                  <tr key={b.category} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 capitalize">
                      {b.name}
                    </td>

                    <td className="p-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.5"
                          value={newRate}
                          onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded"
                        />
                      ) : (
                        <span className="font-bold text-emerald-950 text-sm">
                          ₹{b.referenceRatePerKg}
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-slate-600">
                      {isEditing ? (
                        <input
                          type="text"
                          value={newSource}
                          onChange={(e) => setNewSource(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                        />
                      ) : (
                        <span className="text-[11px]">{b.sourceNote}</span>
                      )}
                    </td>

                    <td className="p-3 text-center text-slate-400 text-[11px]">
                      {b.lastUpdated}
                    </td>

                    <td className="p-3 text-right">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveRate(b.category)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            startEditRate(b.category, b.referenceRatePerKg, b.sourceNote)
                          }
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Verification Desk */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            Recycler Credential & Fleet Verification Desk
          </h3>
          <p className="text-xs text-slate-500">
            Grant or revoke certified recycler badges based on digital scale calibration and compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{v.businessName}</h4>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      v.verified
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {v.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Lead: {v.name}</p>
                <p className="text-[11px] text-slate-400">Vehicle: {v.vehicleType}</p>
                <p className="text-[11px] text-slate-400">Rating: ★ {v.rating} ({v.reviewCount} reviews)</p>
              </div>

              <button
                onClick={() => toggleVendorVerification(v.id)}
                className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
                  v.verified
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {v.verified ? 'Revoke Verification' : 'Verify Vendor Credentials'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dispute Arbitrations Desk */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Reported Weighing Disputes ({disputedTransactions.length})
          </h3>
          <p className="text-xs text-slate-500">
            Arbitrate weight variance and payout disputes between households and collectors
          </p>
        </div>

        {disputedTransactions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            No active disputes flagged. All transactions verified by both parties.
          </div>
        ) : (
          <div className="space-y-3">
            {disputedTransactions.map((dt) => (
              <div
                key={dt.id}
                className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-900">{dt.receiptNumber}</span>
                    <span className="text-slate-600">
                      {dt.householdName} vs {dt.vendorName}
                    </span>
                  </div>
                  <p className="text-rose-800 font-semibold mt-1">
                    Dispute Reason: &ldquo;{dt.disputeReason || 'Weight mismatch'}&rdquo;
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Est: {dt.totalEstimatedWeightKg} kg &bull; Scale: {dt.totalMeasuredWeightKg} kg &bull; Payout: ₹{dt.totalPayout}
                  </p>
                </div>

                <button
                  onClick={() => confirmTransaction(dt.id, 'household')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Resolve & Confirm Receipt
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
