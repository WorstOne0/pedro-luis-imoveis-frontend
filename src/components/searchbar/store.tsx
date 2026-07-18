import { create } from "zustand";

// Must match the enum in the backend real_estate model.
export const PROPERTY_TYPES = ["apartment", "house", "land", "shop", "sobrado"] as const;

export type Filter = {
  propertyType: string[];
  price: { min: number; max: number };
  rooms: number;
  bathrooms: number;
  garages: number;
  area: number;
  district: string;
  search: string;
};

export const DEFAULT_FILTER: Filter = {
  propertyType: [...PROPERTY_TYPES],
  price: { min: 0, max: 0 },
  rooms: 0,
  bathrooms: 0,
  garages: 0,
  area: 0,
  district: "",
  search: "",
};

/**
 * Serialise the filter into the query string GET /real_estate accepts.
 * Neutral values are omitted so the request stays readable and SWR can cache
 * "no filters" under a single key.
 */
export const toQueryString = (filter: Filter) => {
  const params = new URLSearchParams();

  // Sending every type is the same as sending none, and a shorter url.
  if (filter.propertyType.length > 0 && filter.propertyType.length < PROPERTY_TYPES.length) {
    params.set("type", filter.propertyType.join(","));
  }

  if (filter.price.min > 0) params.set("minPrice", String(filter.price.min));
  if (filter.price.max > 0) params.set("maxPrice", String(filter.price.max));
  if (filter.rooms > 0) params.set("rooms", String(filter.rooms));
  if (filter.bathrooms > 0) params.set("bathrooms", String(filter.bathrooms));
  if (filter.garages > 0) params.set("garages", String(filter.garages));
  if (filter.area > 0) params.set("minArea", String(filter.area));
  if (filter.district) params.set("district", filter.district);
  if (filter.search.trim()) params.set("search", filter.search.trim());

  const query = params.toString();
  return query ? `?${query}` : "";
};

type SearchBarStore = {
  isSearchOpen: boolean;
  filter: Filter;
  //
  setIsSearchOpen: (isSearchOpen: boolean) => void;
  setFilter: (update: Partial<Filter>) => void;
  togglePropertyType: (type: string) => void;
  resetFilter: () => void;
};

const useSearchBarStore = create<SearchBarStore>((set) => ({
  isSearchOpen: false,
  filter: DEFAULT_FILTER,
  //
  setIsSearchOpen: (isSearchOpen: boolean) => set({ isSearchOpen }),
  setFilter: (update: Partial<Filter>) => set((state) => ({ filter: { ...state.filter, ...update } })),
  togglePropertyType: (type: string) =>
    set((state) => {
      const propertyType = state.filter.propertyType.includes(type)
        ? state.filter.propertyType.filter((item) => item !== type)
        : [...state.filter.propertyType, type];

      return { filter: { ...state.filter, propertyType } };
    }),
  resetFilter: () => set({ filter: DEFAULT_FILTER }),
}));

export default useSearchBarStore;
