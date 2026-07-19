import { create } from "zustand";

// Must match the enum in the backend real_estate model.
export const PROPERTY_TYPES = ["apartment", "house", "land", "shop", "sobrado"] as const;

export type Filter = {
  propertyType: string[];
  price: { min: number; max: number };
  rooms: number;
  bathrooms: number;
  garages: number;
  // 0 means "not set" for both ends, matching how price works.
  area: { min: number; max: number };
  // Empty means "every district". Shared with the map: clicking a polygon and
  // ticking the multiselect write to this same list.
  district: string[];
  search: string;
};

/**
 * The map's polygon data and the listing data disagree about district names in
 * three ways: case (CANCELLI / Cancelli), accents (CANADA / Canadá) and outright
 * spelling. The first two are handled by normalising; the last needs naming the
 * pairs, since no rule turns "BRAZMADEIRA" into "Brasmadeira".
 *
 * Fixing the source data would be better than carrying this table — the geo file
 * is the odd one out — but that is a data migration, not a frontend change.
 */
const DISTRICT_ALIASES: Record<string, string> = {
  BRAZMADEIRA: "BRASMADEIRA",
  ESMERALDA: "ESMERALD",
};

export const normalizeDistrict = (district: string) => {
  // U+0300-U+036F written as escapes, not literal combining marks: those are
  // invisible in source and get mangled by tooling.
  const key = district
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

  return DISTRICT_ALIASES[key] ?? key;
};

export const isDistrictSelected = (selected: string[], district: string) =>
  selected.some((item) => normalizeDistrict(item) === normalizeDistrict(district));

// Portuguese keeps these lowercase inside a name: "14 de Novembro", not
// "14 De Novembro".
const LOWERCASE_WORDS = new Set(["de", "da", "do", "das", "dos", "e"]);

/**
 * The geo file stores district names in caps. Listings use normal casing, so
 * shouting them next to each other in one list looks broken — title-case the
 * map-only ones for display.
 */
export const toDistrictLabel = (district: string) => {
  if (district !== district.toUpperCase()) return district;

  return district
    .toLowerCase()
    .split(" ")
    .map((word, index) => (index > 0 && LOWERCASE_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
};

export const DEFAULT_FILTER: Filter = {
  propertyType: [...PROPERTY_TYPES],
  price: { min: 0, max: 0 },
  rooms: 0,
  bathrooms: 0,
  garages: 0,
  area: { min: 0, max: 0 },
  district: [],
  search: "",
};

/** True when nothing is narrowed, used to disable the "Limpar" action. */
export const isDefaultFilter = (filter: Filter) =>
  filter.propertyType.length === PROPERTY_TYPES.length &&
  filter.price.min === 0 &&
  filter.price.max === 0 &&
  filter.rooms === 0 &&
  filter.bathrooms === 0 &&
  filter.garages === 0 &&
  filter.area.min === 0 &&
  filter.area.max === 0 &&
  filter.district.length === 0 &&
  filter.search === "";

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
  if (filter.area.min > 0) params.set("minArea", String(filter.area.min));
  if (filter.area.max > 0) params.set("maxArea", String(filter.area.max));
  if (filter.district.length > 0) params.set("district", filter.district.join(","));
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
  toggleDistrict: (district: string) => void;
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
  // The map and the multiselect both call this, which is what keeps them in
  // step — there is one list, not one per surface.
  toggleDistrict: (district: string) =>
    set((state) => {
      const isSelected = isDistrictSelected(state.filter.district, district);

      const nextDistricts = isSelected
        ? state.filter.district.filter((item) => normalizeDistrict(item) !== normalizeDistrict(district))
        : [...state.filter.district, district];

      return { filter: { ...state.filter, district: nextDistricts } };
    }),
  resetFilter: () => set({ filter: DEFAULT_FILTER }),
}));

export default useSearchBarStore;
