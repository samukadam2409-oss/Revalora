import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { MaterialCategory } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Calculator,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface PriceIntelligenceCardProps {
  onQuickList?: (category: MaterialCategory) => void;
}

export const PriceIntelligenceCard: React.FC<PriceIntelligenceCardProps> = ({ onQuickList }) => {
  const { benchmarks, currentRole, updateBenchmarkRate } = useRevalora();

  // Interactive calculator state
  const [calcCategory, setCalcCategory] = useState<MaterialCategory>('paper');
  const [calcWeight, setCalcWeight] = useState<number>(15);

  // Admin inline edit state
  const [editingCategory, setEditingCategory] = useState<MaterialCategory | null>(null);
  const [newRateInput, setNewRateInput] = useState<string>('');

  const selectedBenchmark = benchmarks.find((b) => b.category === calcCategory) || benchmarks[0];
  const estimatedEarn = calcWeight * selectedBenchmark.referenceRatePerKg;
  const estimatedMin = Math.round(estimatedEarn * 0.9);
  const estimatedMax = Math.round(estimatedEarn * 1.15);
  const co2Prevented = (calcWeight * selectedBenchmark.co2FactorPerKg).toFixed(1);

  const categoryIcons: Record<MaterialCategory, string> = {
    paper: '📄',
    cardboard: '📦',
    plastic: '🧴',
    metal: '🔩',
    'e-waste': '🔌',
  };

  const categoryBadges: Record<MaterialCategory, string> = {
    paper: 'bg-amber-50 text-amber-900 border-amber-200',
    cardboard: 'bg-orange-50 text-orange-900 border-orange-200',
    plastic: 'bg-blue-50 text-blue-900 border-blue-200',
    metal: 'bg-slate-100 text-slate-800 border-slate-300',
    'e-waste': 'bg-purple-50 text-purple-900 border-purple-200',
  };

  const handleAdminRateSave = (category: MaterialCategory) => {
    const rateNum = parseFloat(newRateInput);
    if (!isNaN(rateNum) && rateNum > 0) {
      updateBenchmarkRate(category, rateNum, 'Admin live updated via Control Desk');
      setEditingCategory(null);
      setNewRateInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Transparency Disclaimer Banner (SRS Requirement FR-PRICE-03) */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-900">
            Official Transparency Notice (Indicative Scrap Reference Benchmark)
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            All prices shown are indicative reference rates based on local secondary wholesale Mandi samples
            for the <strong>Greenwood & Indiranagar Urban Zones</strong>. Final payout is determined by the
            verified scrap vendor’s competitive offer and certified on-site digital weighing scale.
          </p>
        </div>
      </div>

      {/* Grid of Material Benchmarks */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Scrap Material Reference Rates
            </h2>
            <p className="text-xs text-slate-500">
              Updated daily from verified recycling aggregators
            </p>
          </div>
          {currentRole === 'admin' && (
            <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-semibold border border-purple-200">
              Admin Mode: Click any rate to edit
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {benchmarks.map((item) => {
            const isEditing = editingCategory === item.category;

            return (
              <div
                key={item.category}
                className={`relative flex flex-col justify-between p-4 rounded-2xl bg-white border transition-all duration-200 hover:shadow-md ${
                  calcCategory === item.category
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
                onClick={() => setCalcCategory(item.category)}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-2xl" role="img" aria-label={item.name}>
                      {categoryIcons[item.category]}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${categoryBadges[item.category]}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                    {item.name}
                  </h3>

                  {/* Benchmark rate display / inline edit */}
                  <div className="mt-2 mb-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          step="0.5"
                          value={newRateInput}
                          onChange={(e) => setNewRateInput(e.target.value)}
                          className="w-16 px-1.5 py-1 text-sm border rounded font-bold"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdminRateSave(item.category);
                          }}
                          className="px-2 py-1 bg-emerald-600 text-white text-xs rounded font-medium hover:bg-emerald-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-emerald-950">
                          ₹{item.referenceRatePerKg}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/ kg</span>

                        {currentRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(item.category);
                              setNewRateInput(item.referenceRatePerKg.toString());
                            }}
                            className="ml-auto text-[11px] text-purple-700 hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                    {item.trend === 'up' && (
                      <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> High demand (+4%)
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span className="inline-flex items-center text-rose-600 font-semibold gap-0.5">
                        <TrendingDown className="w-3.5 h-3.5" /> Sluggish (-2%)
                      </span>
                    )}
                    {item.trend === 'stable' && (
                      <span className="inline-flex items-center text-slate-500 font-medium gap-0.5">
                        <Minus className="w-3.5 h-3.5" /> Stable rate
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                  <p className="truncate" title={item.sourceNote}>
                    {item.sourceNote}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Updated: {item.lastUpdated}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Earnings & Impact Calculator (FR-CALC-01 to 03) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Interactive Earnings & Environmental Impact Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate your expected return before scheduling a pickup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-lg border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Formula: Estimated Weight × Benchmark Rate ±15%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Recyclable Material
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {benchmarks.map((b) => (
                  <button
                    key={b.category}
                    type="button"
                    onClick={() => setCalcCategory(b.category)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      calcCategory === b.category
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg mb-1">{categoryIcons[b.category]}</span>
                    <span className="capitalize">{b.category}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span className="uppercase tracking-wider">2. Estimated Weight</span>
                <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  {calcWeight} kg
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="1"
                value={calcWeight}
                onChange={(e) => setCalcWeight(parseInt(e.target.value) || 2)}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>Small bundle (2 kg)</span>
                <span>Average household scrap (25 kg)</span>
                <span>Bulk / Society load (100 kg)</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-emerald-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Estimated Payout Range
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-950">
                  ₹{estimatedMin} – ₹{estimatedMax}
                </span>
                <span className="text-xs text-slate-500">
                  (@ ₹{selectedBenchmark.referenceRatePerKg}/kg)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Actual payout will be calculated as exact digital scale weight × accepted rate.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <p className="text-slate-500 text-[11px]">CO₂ Emissions Saved</p>
                <p className="font-bold text-emerald-900 text-sm mt-0.5">
                  🌱 {co2Prevented} kg CO₂
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                <p className="text-slate-500 text-[11px]">Landfill Diverted</p>
                <p className="font-bold text-blue-900 text-sm mt-0.5">
                  ♻️ {calcWeight} kg waste
                </p>
              </div>
            </div>

            {onQuickList && (
              <button
                onClick={() => onQuickList(calcCategory)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors"
              >
                <span>Create Listing for {selectedBenchmark.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
