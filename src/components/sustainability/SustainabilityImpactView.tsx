import React from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import {
  Leaf,
  Droplets,
  Trees,
  Coins,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const SustainabilityImpactView: React.FC = () => {
  const { metrics, benchmarks } = useRevalora();

  return (
    <div className="space-y-6">
      {/* Hero Impact Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            Circular Economy Performance
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white">
            Transforming Waste Into Community Value
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            REVALORA prevents recyclable scrap from entering municipal overburdened landfills. Through verified vendor channels and community aggregation, households actively contribute to measured carbon avoidance and resource recovery.
          </p>
        </div>
      </div>

      {/* 4 Core Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-emerald-100 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              GHG Carbon Avoided
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-950">
              {metrics.totalCo2SavedKg}{' '}
              <span className="text-sm font-semibold text-slate-400">kg CO₂</span>
            </p>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Prevented via closed-loop re-processing
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-blue-100 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clean Water Saved
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              {metrics.totalWaterSavedLitres.toLocaleString()}{' '}
              <span className="text-sm font-semibold text-slate-400">Litres</span>
            </p>
            <p className="text-xs text-blue-700 font-medium mt-1">
              Conserved compared to virgin material refining
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Trees Saved Equivalent
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Trees className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              {metrics.treesSavedEquivalent}{' '}
              <span className="text-sm font-semibold text-slate-400">Trees</span>
            </p>
            <p className="text-xs text-amber-800 font-medium mt-1">
              Calculated via paper pulp substitution factor
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Circular Income Generated
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-purple-950">
              ₹{metrics.totalEarningsDistributed.toLocaleString()}
            </p>
            <p className="text-xs text-purple-700 font-medium mt-1">
              Paid directly to participating households
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Factor Transparency Table (SRS FR-SUS-02 & FR-SUS-03) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              Documented Conversion Methodology & Assumptions
            </h3>
            <p className="text-xs text-slate-500">
              Transparent parameters used to calculate environmental offsets per kilogram of scrap
            </p>
          </div>

          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Open Circular Methodology
          </span>
        </div>

        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Scrap Material</th>
                <th className="p-3 text-center">CO₂ Avoided / kg</th>
                <th className="p-3 text-center">Water Conserved / kg</th>
                <th className="p-3 text-center">Landfill Diversion / kg</th>
                <th className="p-3">Source & Research Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarks.map((b) => (
                <tr key={b.category} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900 capitalize">
                    {b.name}
                  </td>
                  <td className="p-3 text-center font-semibold text-emerald-800">
                    {b.co2FactorPerKg} kg CO₂
                  </td>
                  <td className="p-3 text-center font-semibold text-blue-800">
                    {b.waterFactorPerKg} Litres
                  </td>
                  <td className="p-3 text-center font-semibold text-slate-700">
                    {b.landfillFactorPerKg} kg waste
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">
                    {b.sourceNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visible Disclaimer (Mandatory Requirement FR-SUS-03) */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Transparency Disclaimer:</strong> Impact figures are mathematical estimates derived from documented lifecycle conversion factors published by secondary recycling associations, not certified laboratory measurements.
          </p>
        </div>
      </div>
    </div>
  );
};
