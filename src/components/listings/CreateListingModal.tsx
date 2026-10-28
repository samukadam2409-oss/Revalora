import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { MaterialCategory, MaterialCondition, ScrapItem } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Camera,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategory?: MaterialCategory;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  preselectedCategory,
}) => {
  const { benchmarks, currentUser, createListing } = useRevalora();

  const [items, setItems] = useState<ScrapItem[]>([
    {
      category: preselectedCategory || 'paper',
      estimatedWeightKg: 10,
      condition: 'clean_dry',
      notes: '',
    },
  ]);

  const [preferredPickupDate, setPreferredPickupDate] = useState<string>('Tomorrow, Oct 29');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // AI Assistant state
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    detectedItems: ScrapItem[];
    confidence: number;
    description: string;
  } | null>(null);

  if (!isOpen) return null;

  const totalEstimatedWeight = items.reduce(
    (sum, item) => sum + (Number(item.estimatedWeightKg) || 0),
    0
  );

  const totalEstimatedEarnings = items.reduce((sum, item) => {
    const bench = benchmarks.find((b) => b.category === item.category);
    const rate = bench ? bench.referenceRatePerKg : 10;
    return sum + (Number(item.estimatedWeightKg) || 0) * rate;
  }, 0);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        category: 'cardboard',
        estimatedWeightKg: 5,
        condition: 'clean_dry',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ScrapItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Simulated Assistive AI photo detector (SRS FR-AI-01 to 04)
  const runSimulatedAiScan = (preset: 'paper_boxes' | 'plastic_bottles' | 'electronics') => {
    setIsScanning(true);
    setAiSuggestion(null);

    setTimeout(() => {
      setIsScanning(false);
      if (preset === 'paper_boxes') {
        setAiSuggestion({
          confidence: 94,
          description: 'Detected stacked newspapers and flattened corrugated packaging boxes.',
          detectedItems: [
            {
              category: 'paper',
              estimatedWeightKg: 12,
              condition: 'clean_dry',
              notes: 'AI detected bundled newspapers',
            },
            {
              category: 'cardboard',
              estimatedWeightKg: 8,
              condition: 'clean_dry',
              notes: 'AI detected flattened cardboard cartons',
            },
          ],
        });
      } else if (preset === 'plastic_bottles') {
        setAiSuggestion({
          confidence: 88,
          description: 'Detected rigid PET/HDPE bottles and detergent containers.',
          detectedItems: [
            {
              category: 'plastic',
              estimatedWeightKg: 14,
              condition: 'clean_dry',
              notes: 'AI identified washed plastic containers',
            },
          ],
        });
      } else {
        setAiSuggestion({
          confidence: 91,
          description: 'Detected assorted circuit boards, copper wiring, and power adapters.',
          detectedItems: [
            {
              category: 'e-waste',
              estimatedWeightKg: 6,
              condition: 'needs_sorting',
              notes: 'AI identified electronic devices & accessories',
            },
            {
              category: 'metal',
              estimatedWeightKg: 4,
              condition: 'mixed',
              notes: 'AI identified metal appliance casings',
            },
          ],
        });
      }
    }, 700);
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setItems(aiSuggestion.detectedItems);
      setAiSuggestion(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalEstimatedWeight <= 0) return;

    createListing({
      items,
      preferredPickupDate,
      timeSlot,
      notes: generalNotes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-950 text-white">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              List Recyclable Scrap for Pickup
            </h3>
            <p className="text-xs text-emerald-200/80">
              Receive competitive quotes from local verified recyclers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* AI Assistance Showcase Banner (SRS FR-AI-01 to 04) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>AI Material Estimator (Heuristic Demo Assistant)</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                Simulated for Hackathon
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              Simulate uploading a photo of your scrap pile to auto-detect categories, condition, and weights:
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runSimulatedAiScan('paper_boxes')}
                disabled={isScanning}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 text-[11px] font-medium shadow-2xs hover:bg-emerald-50/50 transition-colors"
              >
                📸 Scan Paper & Cardboard Pile
              </button>
              <button
                type="button"
                onClick={() => runSimulatedAiScan('plastic_bottles')}
                disabled={isScanning}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 text-[11px] font-medium shadow-2xs hover:bg-emerald-50/50 transition-colors"
              >
                📸 Scan Recyclable Plastics
              </button>
              <button
                type="button"
                onClick={() => runSimulatedAiScan('electronics')}
                disabled={isScanning}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 text-[11px] font-medium shadow-2xs hover:bg-emerald-50/50 transition-colors"
              >
                📸 Scan Old E-Waste & Metal
              </button>
            </div>

            {isScanning && (
              <div className="flex items-center gap-2 text-emerald-700 font-medium py-1">
                <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing scrap image composition...</span>
              </div>
            )}

            {aiSuggestion && (
              <div className="p-3 bg-white rounded-xl border border-emerald-300 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    AI Detection Result ({aiSuggestion.confidence}% confidence)
                  </span>
                  <button
                    type="button"
                    onClick={applyAiSuggestion}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    Apply to Listing
                  </button>
                </div>
                <p className="text-slate-600 text-[11px]">{aiSuggestion.description}</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {aiSuggestion.detectedItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium border border-emerald-200"
                    >
                      {item.category.toUpperCase()}: ~{item.estimatedWeightKg} kg
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Line items section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Scrap Items & Estimated Weight
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Material Line</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const benchmark = benchmarks.find((b) => b.category === item.category);
                const subtotal = (Number(item.estimatedWeightKg) || 0) * (benchmark?.referenceRatePerKg || 10);

                return (
                  <div
                    key={index}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleItemChange(index, 'category', e.target.value as MaterialCategory)
                          }
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2"
                        >
                          {benchmarks.map((b) => (
                            <option key={b.category} value={b.category}>
                              {b.name} (₹{b.referenceRatePerKg}/kg)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={item.estimatedWeightKg}
                          onChange={(e) =>
                            handleItemChange(index, 'estimatedWeightKg', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Condition
                        </label>
                        <select
                          value={item.condition}
                          onChange={(e) =>
                            handleItemChange(index, 'condition', e.target.value as MaterialCondition)
                          }
                          className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2"
                        >
                          <option value="clean_dry">Clean & Dry (Top Rate)</option>
                          <option value="mixed">Mixed Lot</option>
                          <option value="needs_sorting">Needs Sorting</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Remove line"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <input
                        type="text"
                        placeholder="Optional description (e.g., tied bundles, old textbooks)..."
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        className="bg-transparent border-0 focus:ring-0 text-slate-700 w-2/3 text-[11px] placeholder:text-slate-400 p-0"
                      />
                      <span className="font-semibold text-emerald-800">
                        Est: ~₹{Math.round(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule & Pickup window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Pickup Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={preferredPickupDate}
                  onChange={(e) => setPreferredPickupDate(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Today, Oct 28">Today (Express evening slot)</option>
                  <option value="Tomorrow, Oct 29">Tomorrow, Oct 29</option>
                  <option value="Oct 30, Saturday">Oct 30, Saturday (Recommended for society pool)</option>
                  <option value="Oct 31, Sunday">Oct 31, Sunday</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Preferred Time Slot
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="09:00 AM - 11:00 AM">Morning (09:00 AM - 11:00 AM)</option>
                  <option value="11:00 AM - 01:00 PM">Midday (11:00 AM - 01:00 PM)</option>
                  <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                  <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes for Vendor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              General Pickup Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Gate code is #1024, elevator available in Block B..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          {/* Privacy & Locality Indicator (SRS FR-LIST-06) */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 text-slate-600 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <strong>Privacy Protection:</strong> Vendors will only see your general locality (
              <span className="font-medium text-slate-800">{currentUser.locality}</span>).
              Your exact flat/house number is kept private until you accept a vendor offer.
            </div>
          </div>

          {/* Estimated Payout Summary Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-900 font-medium">
                Total Estimated Weight: <strong>{totalEstimatedWeight} kg</strong>
              </p>
              <p className="text-[11px] text-emerald-700">
                Based on benchmark reference prices
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Est. Value</span>
              <p className="text-2xl font-black text-emerald-950">
                ₹{Math.round(totalEstimatedEarnings)}
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
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
              disabled={totalEstimatedWeight <= 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              Publish Scrap Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
