import { create } from "zustand";

export type RealEstate = {
  _id: string;
  //
  title: string;
  description: string;
  type: string;
  sale: string;
  featured: boolean;
  sold: boolean;
  //
  price: number;
  area: number;
  rooms: number;
  bathrooms: number;
  garages: number;
  //
  address: Address;
  //
  features?: string[];
  //
  thumbnail: string;
  images: string[];
  //
  createdAt: Date;
  updatedAt: Date;
};

export type Address = {
  _id: string;
  targetId: string;
  //
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
  complement: string;
  number: string;
  //
  // Stored in Mongo as a plain { lat, lng } object, not a google.maps.LatLng
  // instance — typing it as the class made every read look like it had lat()
  // and lng() methods.
  position?: google.maps.LatLngLiteral | null;
};

// Only UI state lives here now. Server data (the listing list, a single
// listing) comes from useApiFetch/SWR, which owns caching and revalidation —
// keeping a second copy here meant the two could disagree.
type RealEstateStore = {
  realEstateSelected: RealEstate | null;
  setRealEstateSelected: (realEstate: RealEstate | null) => void;
};

const useRealEstateStore = create<RealEstateStore>((set) => ({
  realEstateSelected: null,
  setRealEstateSelected: (realEstate: RealEstate | null) => set({ realEstateSelected: realEstate }),
}));

export default useRealEstateStore;
