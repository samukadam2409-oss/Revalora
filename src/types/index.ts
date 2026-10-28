export type MaterialCategory = 'paper' | 'cardboard' | 'plastic' | 'metal' | 'e-waste';

export type MaterialCondition = 'clean_dry' | 'mixed' | 'needs_sorting';

export type UserRole = 'household' | 'coordinator' | 'vendor' | 'admin';

export interface MaterialPriceBenchmark {
  category: MaterialCategory;
  name: string;
  referenceRatePerKg: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  sourceNote: string;
  historicalRates: { date: string; rate: number }[];
  co2FactorPerKg: number; // kg of CO2 prevented per kg recycled
  waterFactorPerKg: number; // liters of water conserved per kg
  landfillFactorPerKg: number; // kg diverted from landfill
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email: string;
  locality: string;
  society: string;
  addressText: string;
}

export interface VendorProfile {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  serviceLocalities: string[];
  acceptedMaterials: MaterialCategory[];
  vehicleType: string;
}

export interface ScrapItem {
  category: MaterialCategory;
  estimatedWeightKg: number;
  condition: MaterialCondition;
  notes?: string;
  photoUrl?: string;
}

export type ListingStatus =
  | 'open'
  | 'pooled'
  | 'offer_accepted'
  | 'scheduled'
  | 'collected'
  | 'completed'
  | 'cancelled';

export interface ScrapListing {
  id: string;
  householdId: string;
  householdName: string;
  locality: string;
  society: string;
  addressText: string;
  items: ScrapItem[];
  totalEstimatedWeightKg: number;
  estimatedEarnings: number;
  preferredPickupDate: string;
  timeSlot: string;
  status: ListingStatus;
  poolId?: string;
  acceptedOfferId?: string;
  createdAt: string;
  coordinates?: { lat: number; lng: number };
}

export type PoolStatus = 'forming' | 'bidding' | 'locked' | 'scheduled' | 'completed';

export interface CommunityPool {
  id: string;
  name: string;
  coordinatorId: string;
  coordinatorName: string;
  societyName: string;
  locality: string;
  targetPickupDate: string;
  minTotalWeightKg: number;
  currentWeightKg: number;
  memberListingIds: string[];
  status: PoolStatus;
  bonusRatePerKg: number; // Bulk aggregation incentive bonus
  acceptedOfferId?: string;
  createdAt: string;
}

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface VendorOffer {
  id: string;
  targetType: 'listing' | 'pool';
  targetId: string; // listingId or poolId
  targetTitle: string;
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  ratesPerKg: Partial<Record<MaterialCategory, number>>;
  proposedPickupDate: string;
  proposedTimeSlot: string;
  projectedTotal: number;
  benchmarkDiffPercent: number; // positive = premium above benchmark
  status: OfferStatus;
  notes?: string;
  createdAt: string;
}

export type PickupStatus =
  | 'scheduled'
  | 'in_transit'
  | 'arrived'
  | 'collected'
  | 'completed';

export interface PickupTask {
  id: string;
  listingId?: string;
  poolId?: string;
  targetType: 'listing' | 'pool';
  targetTitle: string;
  vendorId: string;
  vendorName: string;
  contactName: string;
  contactPhone: string;
  locality: string;
  addressText: string;
  scheduledDate: string;
  timeSlot: string;
  status: PickupStatus;
  stopOrder: number;
  estimatedWeightKg: number;
  estimatedPayout: number;
  createdAt: string;
}

export interface MeasuredItem {
  category: MaterialCategory;
  estimatedWeightKg: number;
  measuredWeightKg: number;
  ratePerKg: number;
  subtotal: number;
}

export type TransactionStatus = 'pending_confirmation' | 'confirmed' | 'disputed';

export interface TransactionRecord {
  id: string;
  receiptNumber: string;
  targetType: 'listing' | 'pool';
  targetId: string;
  pickupId: string;
  vendorId: string;
  vendorName: string;
  householdId: string;
  householdName: string;
  locality: string;
  society: string;
  items: MeasuredItem[];
  totalEstimatedWeightKg: number;
  totalMeasuredWeightKg: number;
  variancePercentage: number; // (measured - estimated) / estimated * 100
  totalPayout: number;
  householdConfirmed: boolean;
  vendorConfirmed: boolean;
  status: TransactionStatus;
  disputeReason?: string;
  completedAt: string;
  createdAt: string;
  ratings?: {
    byHousehold?: { stars: number; comment: string };
    byVendor?: { stars: number; comment: string };
  };
}

export interface SustainabilityMetrics {
  totalScrapRecycledKg: number;
  totalCo2SavedKg: number;
  totalWaterSavedLitres: number;
  totalLandfillDivertedKg: number;
  treesSavedEquivalent: number;
  totalEarningsDistributed: number;
}

