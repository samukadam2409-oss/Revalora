import React, { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Package, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface DatabaseListing {
  id: string;
  locality: string;
  society: string;
  total_estimated_weight_kg: number;
  preferred_pickup_date: string;
  time_slot: string;
  status: string;
  created_at: string;
}

interface DatabaseListingItem {
  listing_id: string;
  category: string;
  estimated_weight_kg: number;
}

interface SupabaseListingsPanelProps {
  refreshToken: number;
}

export const SupabaseListingsPanel: React.FC<SupabaseListingsPanelProps> = ({ refreshToken }) => {
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [itemsByListing, setItemsByListing] = useState<Record<string, DatabaseListingItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    const loadListings = async () => {
      setIsLoading(true);
      setErrorMessage('');

      if (!isSupabaseConfigured) {
        if (isCurrent) {
          setListings([]);
          setItemsByListing({});
          setErrorMessage('Supabase is not configured in this frontend. Add the required Vite settings and reload the app.');
          setIsLoading(false);
        }
        return;
      }

      const { data: listingRows, error: listingError } = await supabase
        .from('scrap_listings')
        .select('id, locality, society, total_estimated_weight_kg, preferred_pickup_date, time_slot, status, created_at')
        .in('status', ['open', 'pooled', 'scheduled', 'collected', 'completed'])
        .order('created_at', { ascending: false })
        .limit(30);

      if (listingError) {
        if (isCurrent) {
          setListings([]);
          setItemsByListing({});
          setErrorMessage('Could not load scrap listings. Check your connection and Supabase read access, then try again.');
          setIsLoading(false);
        }
        return;
      }

      const rows = (listingRows ?? []) as DatabaseListing[];
      let itemRows: DatabaseListingItem[] = [];

      if (rows.length > 0) {
        const { data, error: itemsError } = await supabase
          .from('scrap_listing_items')
          .select('listing_id, category, estimated_weight_kg')
          .in('listing_id', rows.map((row) => row.id));

        if (itemsError) {
          if (isCurrent) {
            setListings([]);
            setItemsByListing({});
            setErrorMessage('Listings were found, but their material details could not be loaded. Check Supabase read access and try again.');
            setIsLoading(false);
          }
          return;
        }
        itemRows = (data ?? []) as DatabaseListingItem[];
      }

      if (isCurrent) {
        const groupedItems = itemRows.reduce<Record<string, DatabaseListingItem[]>>((grouped, item) => {
          (grouped[item.listing_id] ??= []).push(item);
          return grouped;
        }, {});
        setListings(rows);
        setItemsByListing(groupedItems);
        setIsLoading(false);
      }
    };

    void loadListings();
    return () => {
      isCurrent = false;
    };
  }, [refreshToken, reloadCounter]);

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h3 className="font-bold text-slate-900">Live Scrap Listings</h3>
          <p className="mt-1 text-xs text-slate-500">
            Public listings loaded directly from Supabase. Exact addresses and coordinates are not requested.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadCounter((count) => count + 1)}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="p-8 text-center text-sm text-slate-500">Loading listings from Supabase...</p>
      ) : errorMessage ? (
        <div role="alert" className="p-6 text-center text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-8 text-center">
          <Package className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-800">No public listings yet</p>
          <p className="mt-1 text-xs text-slate-500">
            When households publish listings, they will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {listings.map((listing) => (
            <li key={listing.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">
                    {Number(listing.total_estimated_weight_kg)} kg recyclable material
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {listing.society}, {listing.locality}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    Pickup: {listing.preferred_pickup_date} · {listing.time_slot}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold capitalize text-emerald-800">
                  {listing.status.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(itemsByListing[listing.id] ?? []).map((item, index) => (
                  <span
                    key={`${listing.id}-${item.category}-${index}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                  >
                    <span className="capitalize">{item.category}</span> · {Number(item.estimated_weight_kg)} kg
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                Posted {new Date(listing.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
