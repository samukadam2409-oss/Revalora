import React, { createContext, useState, useEffect } from 'react';
import type {
  MaterialPriceBenchmark,
  UserProfile,
  VendorProfile,
  ScrapListing,
  CommunityPool,
  VendorOffer,
  PickupTask,
  TransactionRecord,
  UserRole,
  SustainabilityMetrics,
  MaterialCategory,
  ScrapItem,
} from '../types';
import {
  SEED_BENCHMARKS,
  SEED_USERS,
  SEED_VENDORS,
  SEED_LISTINGS,
  SEED_POOLS,
  SEED_OFFERS,
  SEED_PICKUPS,
  SEED_TRANSACTIONS,
} from '../services/seedData';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface RevaloraContextType {
  // Current session & role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  currentVendor: VendorProfile;
  switchUser: (userId: string) => void;
  switchVendor: (vendorId: string) => void;

  // State data
  benchmarks: MaterialPriceBenchmark[];
  users: UserProfile[];
  vendors: VendorProfile[];
  listings: ScrapListing[];
  pools: CommunityPool[];
  offers: VendorOffer[];
  pickups: PickupTask[];
  transactions: TransactionRecord[];
  metrics: SustainabilityMetrics;

  // Actions
  createListing: (data: {
    items: ScrapItem[];
    preferredPickupDate: string;
    timeSlot: string;
    notes?: string;
  }) => ScrapListing;
  cancelListing: (listingId: string) => void;
  joinPool: (poolId: string, listingId: string) => void;
  leavePool: (poolId: string, listingId: string) => void;
  createPool: (data: {
    name: string;
    targetPickupDate: string;
    minTotalWeightKg: number;
    bonusRatePerKg: number;
  }) => CommunityPool;
  submitVendorOffer: (data: {
    targetType: 'listing' | 'pool';
    targetId: string;
    targetTitle: string;
    ratesPerKg: Partial<Record<MaterialCategory, number>>;
    proposedPickupDate: string;
    proposedTimeSlot: string;
    notes?: string;
  }) => VendorOffer;
  acceptOffer: (offerId: string) => void;
  updatePickupStatus: (pickupId: string, status: PickupTask['status']) => void;
  completeCollection: (data: {
    pickupId: string;
    measuredItems: {
      category: MaterialCategory;
      measuredWeightKg: number;
      ratePerKg: number;
    }[];
  }) => TransactionRecord;
  confirmTransaction: (transactionId: string, party: 'household' | 'vendor') => void;
  disputeTransaction: (transactionId: string, reason: string) => void;
  addTransactionRating: (
    transactionId: string,
    party: 'household' | 'vendor',
    stars: number,
    comment: string
  ) => void;
  updateBenchmarkRate: (category: MaterialCategory, newRate: number, sourceNote: string) => void;
  toggleVendorVerification: (vendorId: string) => void;
  resetAllDemoData: () => void;

  // Toast notifications
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;
}

const STORAGE_KEY = 'revalora_mvp_state_v1';

export const RevaloraContext = createContext<RevaloraContextType | undefined>(undefined);

export const RevaloraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('household');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persistent collections
  const [benchmarks, setBenchmarks] = useState<MaterialPriceBenchmark[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_benchmarks`);
    return saved ? JSON.parse(saved) : SEED_BENCHMARKS;
  });

  const [users] = useState<UserProfile[]>(SEED_USERS);
  const [vendors, setVendors] = useState<VendorProfile[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vendors`);
    return saved ? JSON.parse(saved) : SEED_VENDORS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(SEED_USERS[0]);
  const [currentVendor, setCurrentVendor] = useState<VendorProfile>(SEED_VENDORS[0]);

  const [listings, setListings] = useState<ScrapListing[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_listings`);
    return saved ? JSON.parse(saved) : SEED_LISTINGS;
  });

  const [pools, setPools] = useState<CommunityPool[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pools`);
    return saved ? JSON.parse(saved) : SEED_POOLS;
  });

  const [offers, setOffers] = useState<VendorOffer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_offers`);
    return saved ? JSON.parse(saved) : SEED_OFFERS;
  });

  const [pickups, setPickups] = useState<PickupTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pickups`);
    return saved ? JSON.parse(saved) : SEED_PICKUPS;
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_benchmarks`, JSON.stringify(benchmarks));
  }, [benchmarks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vendors`, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_listings`, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pools`, JSON.stringify(pools));
  }, [pools]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_offers`, JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pickups`, JSON.stringify(pickups));
  }, [pickups]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  // Toast notification helper
  const showToast = (message: string, type: ToastNotification['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      showToast(`Switched active profile to ${target.name}`, 'info');
    }
  };

  const switchVendor = (vendorId: string) => {
    const target = vendors.find((v) => v.id === vendorId);
    if (target) {
      setCurrentVendor(target);
      showToast(`Switched active vendor to ${target.businessName}`, 'info');
    }
  };

  // Actions implementation
  const createListing = (data: {
    items: ScrapItem[];
    preferredPickupDate: string;
    timeSlot: string;
    notes?: string;
  }): ScrapListing => {
    const totalEstimatedWeightKg = data.items.reduce(
      (sum, item) => sum + (Number(item.estimatedWeightKg) || 0),
      0
    );

    const estimatedEarnings = data.items.reduce((sum, item) => {
      const benchmark = benchmarks.find((b) => b.category === item.category);
      const rate = benchmark ? benchmark.referenceRatePerKg : 10;
      return sum + (Number(item.estimatedWeightKg) || 0) * rate;
    }, 0);

    const newListing: ScrapListing = {
      id: `list_${Date.now()}`,
      householdId: currentUser.id,
      householdName: currentUser.name,
      locality: currentUser.locality,
      society: currentUser.society,
      addressText: currentUser.addressText,
      items: data.items,
      totalEstimatedWeightKg,
      estimatedEarnings,
      preferredPickupDate: data.preferredPickupDate,
      timeSlot: data.timeSlot,
      status: 'open',
      createdAt: new Date().toISOString(),
      coordinates: { lat: 18.5204 + (Math.random() - 0.5) * 0.01, lng: 73.8567 + (Math.random() - 0.5) * 0.01 },
    };

    setListings((prev) => [newListing, ...prev]);
    showToast(`Scrap listing created for ${totalEstimatedWeightKg} kg recyclable material!`, 'success');
    return newListing;
  };

  const cancelListing = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: 'cancelled' } : l))
    );
    showToast('Scrap listing cancelled', 'info');
  };

  const joinPool = (poolId: string, listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    const pool = pools.find((p) => p.id === poolId);
    if (!listing || !pool) return;

    if (listing.status !== 'open') {
      showToast('Only open listings can join a pool', 'warning');
      return;
    }

    if (pool.memberListingIds.includes(listingId)) {
      showToast('This listing is already in this pool', 'warning');
      return;
    }

    // Update listing
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: 'pooled', poolId } : l))
    );

    // Update pool aggregate weight and membership
    setPools((prev) =>
      prev.map((p) => {
        if (p.id === poolId) {
          const updatedMembers = [...p.memberListingIds, listingId];
          const newWeight = p.currentWeightKg + listing.totalEstimatedWeightKg;
          return {
            ...p,
            memberListingIds: updatedMembers,
            currentWeightKg: newWeight,
            status: newWeight >= p.minTotalWeightKg ? 'bidding' : p.status,
          };
        }
        return p;
      })
    );

    showToast(
      `Joined "${pool.name}"! +${listing.totalEstimatedWeightKg} kg added to community aggregate.`,
      'success'
    );
  };

  const leavePool = (poolId: string, listingId: string) => {
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: 'open', poolId: undefined } : l))
    );

    setPools((prev) =>
      prev.map((p) => {
        if (p.id === poolId) {
          const updatedMembers = p.memberListingIds.filter((id) => id !== listingId);
          const newWeight = Math.max(0, p.currentWeightKg - listing.totalEstimatedWeightKg);
          return {
            ...p,
            memberListingIds: updatedMembers,
            currentWeightKg: newWeight,
          };
        }
        return p;
      })
    );

    showToast(`Withdrawn from community pool. Listing restored to individual open status.`, 'info');
  };

  const createPool = (data: {
    name: string;
    targetPickupDate: string;
    minTotalWeightKg: number;
    bonusRatePerKg: number;
  }): CommunityPool => {
    const newPool: CommunityPool = {
      id: `pool_${Date.now()}`,
      name: data.name,
      coordinatorId: currentUser.id,
      coordinatorName: currentUser.name,
      societyName: currentUser.society,
      locality: currentUser.locality,
      targetPickupDate: data.targetPickupDate,
      minTotalWeightKg: data.minTotalWeightKg,
      currentWeightKg: 0,
      memberListingIds: [],
      status: 'forming',
      bonusRatePerKg: data.bonusRatePerKg,
      createdAt: new Date().toISOString(),
    };

    setPools((prev) => [newPool, ...prev]);
    showToast(`Created new Community Scrap Pool: "${data.name}"`, 'success');
    return newPool;
  };

  const submitVendorOffer = (data: {
    targetType: 'listing' | 'pool';
    targetId: string;
    targetTitle: string;
    ratesPerKg: Partial<Record<MaterialCategory, number>>;
    proposedPickupDate: string;
    proposedTimeSlot: string;
    notes?: string;
  }): VendorOffer => {
    // Calculate projected total
    let projectedTotal = 0;
    let benchmarkTotal = 0;

    if (data.targetType === 'listing') {
      const listing = listings.find((l) => l.id === data.targetId);
      if (listing) {
        listing.items.forEach((item) => {
          const offeredRate = data.ratesPerKg[item.category] || 0;
          projectedTotal += item.estimatedWeightKg * offeredRate;

          const bench = benchmarks.find((b) => b.category === item.category);
          benchmarkTotal += item.estimatedWeightKg * (bench?.referenceRatePerKg || offeredRate);
        });
      }
    } else {
      const pool = pools.find((p) => p.id === data.targetId);
      if (pool) {
        // Average rate applied to pool's total weight
        const rates = Object.values(data.ratesPerKg);
        const avgRate = rates.length > 0 ? rates.reduce((a, b) => (a || 0) + (b || 0), 0) / rates.length : 20;
        projectedTotal = Math.round(pool.currentWeightKg * avgRate);
        benchmarkTotal = Math.round(pool.currentWeightKg * 18);
      }
    }

    const diffPercent =
      benchmarkTotal > 0 ? Number((((projectedTotal - benchmarkTotal) / benchmarkTotal) * 100).toFixed(1)) : 0;

    const newOffer: VendorOffer = {
      id: `offer_${Date.now()}`,
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: data.targetTitle,
      vendorId: currentVendor.id,
      vendorName: currentVendor.businessName,
      vendorRating: currentVendor.rating,
      ratesPerKg: data.ratesPerKg,
      proposedPickupDate: data.proposedPickupDate,
      proposedTimeSlot: data.proposedTimeSlot,
      projectedTotal: Math.round(projectedTotal),
      benchmarkDiffPercent: diffPercent,
      status: 'pending',
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    setOffers((prev) => [newOffer, ...prev]);
    showToast(`Quote of ₹${Math.round(projectedTotal)} submitted for ${data.targetTitle}!`, 'success');
    return newOffer;
  };

  const acceptOffer = (offerId: string) => {
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) return;

    // 1. Mark accepted offer, decline/close other offers on the same target
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          return { ...o, status: 'accepted' };
        }
        if (o.targetId === offer.targetId && o.status === 'pending') {
          return { ...o, status: 'declined' };
        }
        return o;
      })
    );

    // 2. Update target status
    if (offer.targetType === 'listing') {
      const listing = listings.find((l) => l.id === offer.targetId);
      if (listing) {
        setListings((prev) =>
          prev.map((l) =>
            l.id === listing.id
              ? { ...l, status: 'scheduled', acceptedOfferId: offer.id }
              : l
          )
        );

        // 3. Create scheduled pickup task
        const newPickup: PickupTask = {
          id: `pickup_${Date.now()}`,
          listingId: listing.id,
          targetType: 'listing',
          targetTitle: `${listing.householdName} (${listing.totalEstimatedWeightKg} kg)`,
          vendorId: offer.vendorId,
          vendorName: offer.vendorName,
          contactName: listing.householdName,
          contactPhone: '+91 98230 45671',
          locality: listing.locality,
          addressText: listing.addressText,
          scheduledDate: offer.proposedPickupDate,
          timeSlot: offer.proposedTimeSlot,
          status: 'scheduled',
          stopOrder: pickups.length + 1,
          estimatedWeightKg: listing.totalEstimatedWeightKg,
          estimatedPayout: offer.projectedTotal,
          createdAt: new Date().toISOString(),
        };

        setPickups((prev) => [...prev, newPickup]);
      }
    } else {
      // Pool offer accepted
      const pool = pools.find((p) => p.id === offer.targetId);
      if (pool) {
        setPools((prev) =>
          prev.map((p) =>
            p.id === pool.id
              ? { ...p, status: 'scheduled', acceptedOfferId: offer.id }
              : p
          )
        );

        // Lock all member listings
        setListings((prev) =>
          prev.map((l) =>
            pool.memberListingIds.includes(l.id)
              ? { ...l, status: 'scheduled', acceptedOfferId: offer.id }
              : l
          )
        );

        const newPickup: PickupTask = {
          id: `pickup_${Date.now()}`,
          poolId: pool.id,
          targetType: 'pool',
          targetTitle: `${pool.name} (${pool.currentWeightKg} kg)`,
          vendorId: offer.vendorId,
          vendorName: offer.vendorName,
          contactName: `${pool.coordinatorName} (Society Coordinator)`,
          contactPhone: '+91 94451 98210',
          locality: pool.locality,
          addressText: `${pool.societyName} Central Collection Bay`,
          scheduledDate: offer.proposedPickupDate,
          timeSlot: offer.proposedTimeSlot,
          status: 'scheduled',
          stopOrder: pickups.length + 1,
          estimatedWeightKg: pool.currentWeightKg,
          estimatedPayout: offer.projectedTotal,
          createdAt: new Date().toISOString(),
        };

        setPickups((prev) => [...prev, newPickup]);
      }
    }

    showToast(`Offer from ${offer.vendorName} accepted! Pickup scheduled.`, 'success');
  };

  const updatePickupStatus = (pickupId: string, status: PickupTask['status']) => {
    setPickups((prev) =>
      prev.map((p) => (p.id === pickupId ? { ...p, status } : p))
    );
    showToast(`Pickup status updated to ${status.replace('_', ' ')}`, 'info');
  };

  const completeCollection = (data: {
    pickupId: string;
    measuredItems: {
      category: MaterialCategory;
      measuredWeightKg: number;
      ratePerKg: number;
    }[];
  }): TransactionRecord => {
    const pickup = pickups.find((p) => p.id === data.pickupId);
    if (!pickup) throw new Error('Pickup not found');

    const totalMeasuredWeightKg = Number(
      data.measuredItems.reduce((acc, i) => acc + i.measuredWeightKg, 0).toFixed(1)
    );

    const totalPayout = Number(
      data.measuredItems
        .reduce((acc, i) => acc + i.measuredWeightKg * i.ratePerKg, 0)
        .toFixed(2)
    );

    const estimatedWeight = pickup.estimatedWeightKg || 1;
    const variancePercentage = Number(
      (((totalMeasuredWeightKg - estimatedWeight) / estimatedWeight) * 100).toFixed(1)
    );

    const measuredItemsWithSubtotal = data.measuredItems.map((item) => ({
      category: item.category,
      estimatedWeightKg: Math.round(item.measuredWeightKg * 0.95),
      measuredWeightKg: item.measuredWeightKg,
      ratePerKg: item.ratePerKg,
      subtotal: Number((item.measuredWeightKg * item.ratePerKg).toFixed(2)),
    }));

    const newTransaction: TransactionRecord = {
      id: `txn_${Date.now()}`,
      receiptNumber: `REV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      targetType: pickup.targetType,
      targetId: pickup.listingId || pickup.poolId || '',
      pickupId: pickup.id,
      vendorId: pickup.vendorId,
      vendorName: pickup.vendorName,
      householdId: currentUser.id,
      householdName: pickup.contactName,
      locality: pickup.locality,
      society: currentUser.society,
      items: measuredItemsWithSubtotal,
      totalEstimatedWeightKg: pickup.estimatedWeightKg,
      totalMeasuredWeightKg,
      variancePercentage,
      totalPayout,
      householdConfirmed: false,
      vendorConfirmed: true, // Vendor initiated collection
      status: 'pending_confirmation',
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    // Update pickup status
    setPickups((prev) =>
      prev.map((p) => (p.id === data.pickupId ? { ...p, status: 'collected' } : p))
    );

    // Update listing or pool status
    if (pickup.listingId) {
      setListings((prev) =>
        prev.map((l) => (l.id === pickup.listingId ? { ...l, status: 'collected' } : l))
      );
    }

    showToast(
      `Scrap weighed: ${totalMeasuredWeightKg} kg. Payout: ₹${totalPayout}. Pending household confirmation.`,
      variancePercentage > 20 || variancePercentage < -20 ? 'warning' : 'success'
    );

    return newTransaction;
  };

  const confirmTransaction = (transactionId: string, party: 'household' | 'vendor') => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const updated = {
            ...t,
            householdConfirmed: party === 'household' ? true : t.householdConfirmed,
            vendorConfirmed: party === 'vendor' ? true : t.vendorConfirmed,
          };
          if (updated.householdConfirmed && updated.vendorConfirmed) {
            updated.status = 'confirmed';
          }
          return updated;
        }
        return t;
      })
    );

    // Also update listing status to completed
    const txn = transactions.find((t) => t.id === transactionId);
    if (txn && txn.targetId) {
      setListings((prev) =>
        prev.map((l) => (l.id === txn.targetId ? { ...l, status: 'completed' } : l))
      );
    }

    showToast(`Transaction confirmed by ${party}! Digital receipt verified.`, 'success');
  };

  const disputeTransaction = (transactionId: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { ...t, status: 'disputed', disputeReason: reason }
          : t
      )
    );
    showToast(`Dispute flagged for admin review: "${reason}"`, 'warning');
  };

  const addTransactionRating = (
    transactionId: string,
    party: 'household' | 'vendor',
    stars: number,
    comment: string
  ) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === transactionId) {
          const ratings = t.ratings || {};
          if (party === 'household') {
            ratings.byHousehold = { stars, comment };
          } else {
            ratings.byVendor = { stars, comment };
          }
          return { ...t, ratings };
        }
        return t;
      })
    );
    showToast(`Review submitted (${stars} stars). Thank you for maintaining trust!`, 'success');
  };

  const updateBenchmarkRate = (
    category: MaterialCategory,
    newRate: number,
    sourceNote: string
  ) => {
    setBenchmarks((prev) =>
      prev.map((b) => {
        if (b.category === category) {
          const todayLabel = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...b,
            referenceRatePerKg: newRate,
            sourceNote,
            lastUpdated: todayLabel,
            trend: newRate > b.referenceRatePerKg ? 'up' : newRate < b.referenceRatePerKg ? 'down' : 'stable',
            historicalRates: [
              ...b.historicalRates,
              { date: 'Today', rate: newRate },
            ],
          };
        }
        return b;
      })
    );
    showToast(`Updated benchmark rate for ${category} to ₹${newRate}/kg`, 'success');
  };

  const toggleVendorVerification = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, verified: !v.verified } : v))
    );
    showToast('Vendor verification status toggled', 'info');
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_benchmarks`);
    localStorage.removeItem(`${STORAGE_KEY}_vendors`);
    localStorage.removeItem(`${STORAGE_KEY}_listings`);
    localStorage.removeItem(`${STORAGE_KEY}_pools`);
    localStorage.removeItem(`${STORAGE_KEY}_offers`);
    localStorage.removeItem(`${STORAGE_KEY}_pickups`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);

    setBenchmarks(SEED_BENCHMARKS);
    setVendors(SEED_VENDORS);
    setListings(SEED_LISTINGS);
    setPools(SEED_POOLS);
    setOffers(SEED_OFFERS);
    setPickups(SEED_PICKUPS);
    setTransactions(SEED_TRANSACTIONS);

    showToast('Demo data reset to pristine seed state', 'success');
  };

  // Aggregated sustainability metrics computed from confirmed transactions
  const metrics: SustainabilityMetrics = React.useMemo(() => {
    const confirmedTxns = transactions.filter((t) => t.status === 'confirmed');

    let totalWeight = 0;
    let totalPayout = 0;
    let totalCo2 = 0;
    let totalWater = 0;
    let totalLandfill = 0;

    confirmedTxns.forEach((txn) => {
      totalPayout += txn.totalPayout;
      txn.items.forEach((item) => {
        const weight = item.measuredWeightKg;
        totalWeight += weight;
        const bench = benchmarks.find((b) => b.category === item.category);
        if (bench) {
          totalCo2 += weight * bench.co2FactorPerKg;
          totalWater += weight * bench.waterFactorPerKg;
          totalLandfill += weight * bench.landfillFactorPerKg;
        } else {
          totalCo2 += weight * 1.2;
          totalWater += weight * 20;
          totalLandfill += weight * 1.0;
        }
      });
    });

    // Baseline factor: ~60 kg paper/cardboard/wood recycled saves 1 tree equivalent
    const trees = Math.round(totalWeight / 45);

    return {
      totalScrapRecycledKg: Number(totalWeight.toFixed(1)),
      totalCo2SavedKg: Number(totalCo2.toFixed(1)),
      totalWaterSavedLitres: Math.round(totalWater),
      totalLandfillDivertedKg: Number(totalLandfill.toFixed(1)),
      treesSavedEquivalent: Math.max(1, trees),
      totalEarningsDistributed: Math.round(totalPayout),
    };
  }, [transactions, benchmarks]);

  return (
    <RevaloraContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        currentVendor,
        switchUser,
        switchVendor,
        benchmarks,
        users,
        vendors,
        listings,
        pools,
        offers,
        pickups,
        transactions,
        metrics,
        createListing,
        cancelListing,
        joinPool,
        leavePool,
        createPool,
        submitVendorOffer,
        acceptOffer,
        updatePickupStatus,
        completeCollection,
        confirmTransaction,
        disputeTransaction,
        addTransactionRating,
        updateBenchmarkRate,
        toggleVendorVerification,
        resetAllDemoData,
        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </RevaloraContext.Provider>
  );
};

export { useRevalora } from './useRevalora';
