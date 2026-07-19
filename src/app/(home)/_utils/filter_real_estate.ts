import type { RealEstate } from "@/store/real_estate";
import { PROPERTY_TYPES, normalizeDistrict, type Filter } from "../_components/searchbar/store";

/**
 * Applies the searchbar filter in the browser.
 *
 * The page already downloads the whole catalogue — the map draws a marker per
 * listing and the price histogram needs every price for its fixed bounds — so
 * asking the API to filter as well was paying twice for the same answer. One
 * fetch, filtered here, means no request per keystroke or slider drag and no
 * loading state between filter changes.
 *
 * This mirrors backend/src/features/real_estate/utils/real_estate_query.js.
 * The API keeps its filters: the dashboard and any other client still use them,
 * and they are the ones that matter once the catalogue outgrows a single fetch.
 * If you change the rules in one place, change them in the other.
 */

// "At least N" — a 3 bedroom house still matches a search for 2 bedrooms.
const atLeast = (value: number, minimum: number) => minimum <= 0 || value >= minimum;

const inRange = (value: number, min: number, max: number) => (min <= 0 || value >= min) && (max <= 0 || value <= max);

const matchesSearch = (realEstate: RealEstate, term: string) => {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const address = realEstate.address;

  return [realEstate.title, realEstate.description, address?.street, address?.district, address?.city]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(needle));
};

export const filterRealEstate = (realEstateList: RealEstate[], filter: Filter, savedIds: string[] = []) => {
  // Every type selected is the same as no type filter, matching how the query
  // string used to omit it.
  const isEveryType = filter.propertyType.length === PROPERTY_TYPES.length;
  const districts = filter.district.map(normalizeDistrict);

  return realEstateList.filter((realEstate) => {
    // Saved-only is a client concept — the API has no idea what this visitor
    // has saved.
    if (filter.savedOnly && !savedIds.includes(realEstate._id)) return false;

    if (!isEveryType && !filter.propertyType.includes(realEstate.type)) return false;

    if (!inRange(realEstate.price, filter.price.min, filter.price.max)) return false;
    if (!inRange(realEstate.area, filter.area.min, filter.area.max)) return false;

    if (!atLeast(realEstate.rooms, filter.rooms)) return false;
    if (!atLeast(realEstate.bathrooms, filter.bathrooms)) return false;
    if (!atLeast(realEstate.garages, filter.garages)) return false;

    // Empty means "every district"; names are normalised because the map's
    // polygon data and the listings spell them differently.
    if (districts.length > 0) {
      const district = realEstate.address?.district;
      if (!district || !districts.includes(normalizeDistrict(district))) return false;
    }

    return matchesSearch(realEstate, filter.search);
  });
};
