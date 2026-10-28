import React, { useState } from 'react';
import { useRevalora } from '../../context/RevaloraContext';
import type { MaterialCategory, MaterialCondition, ScrapItem } from '../../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
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
  MapPin,
} from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategory?: MaterialCategory;
  onListingCreated?: () => void;
}

const getTomorrowDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  preselectedCategory,
  onListingCreated,
}) => {
  const { benchmarks } = useRevalora();

  const [items, setItems] = useState<ScrapItem[]>([
    {
      category: preselectedCategory || 'paper',
      estimatedWeightKg: 10,
      condition: 'clean_dry',
      notes: '',
    },
  ]);

  const [locality, setLocality] = useState('');
  const [society, setSociety] = useState('');
  const [preferredPickupDate, setPreferredPickupDate] = useState<string>(getTomorrowDate);
  const [timeSlot, setTimeSlot] = useState<string>('09:00 AM - 11:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!locality.trim() || !society.trim()) {
      setSubmitError('Enter your locality and society to create a listing.');
      return;
    }

    if (items.some((item) => !Number.isFinite(Number(item.estimatedWeightKg)) || Number(item.estimatedWeightKg) <= 0)) {
      setSubmitError('Each material line must have a weight greater than zero.');
      return;
    }

    if (!isSupabaseConfigured) {
      setSubmitError('Supabase is not configured in this frontend. Add the required Vite settings and reload the app.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        setSubmitError('Please sign in with a Supabase household account before creating a listing. The demo profile is not an authenticated account.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        setSubmitError('Could not verify your household profile. Please confirm your account setup and try again.');
        return;
      }
      if (profile.role !== 'household') {
        setSubmitError('Only a household account can create a household scrap listing.');
        return;
      }

      const categories = [...new Set(items.map((item) => item.category))];
      const { data: priceRows, error: pricesError } = await supabase
        .from('material_benchmarks')
        .select('category, reference_rate_per_kg')
        .in('category', categories);

      if (pricesError || !priceRows) {
        setSubmitError('Could not load current material benchmarks, so the listing was not created. Please try again later.');
        return;
      }

      const ratesByCategory = new Map(
        priceRows.map((row) => [row.category, Number(row.reference_rate_per_kg)])
      );
      if (categories.some((category) => !ratesByCategory.has(category))) {
        setSubmitError('A current benchmark is missing for one of the selected materials. The listing was not created.');
        return;
      }

      const totalWeight = items.reduce((sum, item) => sum + Number(item.estimatedWeightKg), 0);
      const estimatedEarnings = items.reduce(
        (sum, item) => sum + Number(item.estimatedWeightKg) * (ratesByCategory.get(item.category) ?? 0),
        0
      );

      const { data: listing, error: listingError } = await supabase
        .from('scrap_listings')
        .insert({
          household_id: authData.user.id,
          locality: locality.trim(),
          society: society.trim(),
          total_estimated_weight_kg: totalWeight,
          estimated_earnings: estimatedEarnings,
          preferred_pickup_date: preferredPickupDate,
          time_slot: timeSlot,
          status: 'open',
        })
        .select('id')
        .single();

      if (listingError || !listing) {
        setSubmitError(
          listingError?.code === '42501'
            ? 'Supabase did not allow this listing. Check that you are signed in as the listing owner and that your account has household permissions.'
            : 'Could not save the listing. Check your connection and account permissions, then try again.'
        );
        return;
      }

      const itemRows = items.map((item) => ({
        listing_id: listing.id,
        category: item.category,
        estimated_weight_kg: Number(item.estimatedWeightKg),
        condition: item.condition,
        notes: item.notes?.trim() || null,
      }));
      const { error: itemsError } = await supabase
        .from('scrap_listing_items')
        .insert(itemRows);

      if (itemsError) {
        const { error: cleanupError } = await supabase
          .from('scrap_listings')
          .delete()
          .eq('id', listing.id)
          .eq('household_id', authData.user.id);

        setSubmitError(
          cleanupError
            ? 'The listing was created, but its material details failed to save and automatic cleanup also failed. Please contact support.'
            : 'The material details could not be saved, so the incomplete listing was removed. Please try again.'
        );
        return;
      }

      setSubmitSuccess('Your scrap listing was saved successfully.');
      onListingCreated?.();
      window.setTimeout(onClose, 900);
    } catch {
      setSubmitError('A network error interrupted the request. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="listing-locality" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Locality
              </label>
              <input
                id="listing-locality"
                required
                maxLength={120}
                value={locality}
                onChange={(event) => setLocality(event.target.value)}
                placeholder="Your neighborhood"
                className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="listing-society" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Society / Community
              </label>
              <input
                id="listing-society"
                required
                maxLength={120}
                value={society}
                onChange={(event) => setSociety(event.target.value)}
                placeholder="Your society or community"
                className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
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
                          min="0.01"
                          step="0.01"
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
                <input
                  type="date"
                  min={getTomorrowDate()}
                  value={preferredPickupDate}
                  onChange={(e) => setPreferredPickupDate(e.target.value)}
                  required
                  className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
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

          {/* Privacy & Locality Indicator (SRS FR-LIST-06) */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-100 text-slate-600 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
            </div>
            <div className="text-[11px] leading-relaxed">
              <strong>Privacy Protection:</strong> Only your locality and society are included here. Do not enter a flat number, exact address, phone number, or access code in material notes.
            </div>
          </div>

          {/* Estimated Payout Summary Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-900 font-medium">
                Total Estimated Weight: <strong>{totalEstimatedWeight} kg</strong>
              </p>
              <p className="text-[11px] text-emerald-700">
                Preview uses local sample rates; the saved estimate uses current Supabase benchmark rates.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Est. Value</span>
              <p className="text-2xl font-black text-emerald-950">
                ₹{Math.round(totalEstimatedEarnings)}
              </p>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {submitSuccess}
            </p>
          )}

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
              disabled={isSubmitting || totalEstimatedWeight <= 0 || !preferredPickupDate || !locality.trim() || !society.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Saving listing...' : 'Publish Scrap Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
