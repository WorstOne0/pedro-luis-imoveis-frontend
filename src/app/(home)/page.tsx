"use client";

// Next
import { useState, useRef, useMemo } from "react";
import { useApiFetch, useLogEvent } from "@/hooks";
// Store
import { RealEstate } from "@/store/real_estate";
import { useRealEstateStore, useSearchBarStore, useSavedStore } from "@/store";
// Components
import { DistrictPolygons, GoogleMaps } from "@/components";
import Searchbar from "./_components/searchbar";
import MapMarkers from "./_components/map_markers";
import RealEstateCard from "./_components/real_estate_card";
// Utils
import { useMarkerClusters, hasRealPosition } from "./_components/use_marker_clusters";
import { filterRealEstate } from "./_utils/filter_real_estate";

// Module scope so the reference is stable across renders. A `= []` default
// builds a new array every render, and that reference feeds the clustering
// effect's deps — it re-ran each render, set state, and re-rendered, which is
// the "Maximum update depth exceeded" loop.
const EMPTY: RealEstate[] = [];

const CARD_HEIGHT = 340;
const CARD_GAP = 15;

export default function Home() {
  useLogEvent("page_view", { page: "Home", route: "/" });

  const filter = useSearchBarStore((state) => state.filter);
  const isSearchOpen = useSearchBarStore((state) => state.isSearchOpen);
  const setRealEstateSelected = useRealEstateStore((state) => state.setRealEstateSelected);
  const realEstateSelected = useRealEstateStore((state) => state.realEstateSelected);
  const savedIds = useSavedStore((state) => state.savedIds);

  // One request for the whole catalogue, filtered in the browser.
  //
  // The map draws a marker per listing and the price histogram needs every
  // price for its fixed bounds, so the full catalogue is downloaded either way
  // — asking the API to filter as well was paying twice for the same answer.
  // Filtering here also drops the debounce: no request per keystroke or slider
  // drag, and no loading flicker between filter changes.
  const { data, isLoading } = useApiFetch<RealEstate[]>("/real_estate");
  const catalogue = data ?? EMPTY;

  const realEstateList = useMemo(() => filterRealEstate(catalogue, filter, savedIds), [catalogue, filter, savedIds]);

  // From the unfiltered catalogue so the map keeps offering every district that
  // has listings, even once the results are narrowed to one of them.
  const catalogueDistricts = useMemo(
    () => [...new Set(catalogue.map((item) => item.address?.district).filter(Boolean))] as string[],
    [catalogue]
  );

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const onCreateMap = (map: google.maps.Map) => setMap(map);

  const clusters = useMarkerClusters(map, realEstateList);

  const onMarkerSelect = (realEstate: RealEstate) => {
    setRealEstateSelected(realEstate);

    const index = realEstateList.findIndex((item) => item._id === realEstate._id);
    if (index >= 0) listRef.current?.scrollTo({ top: index * (CARD_HEIGHT + CARD_GAP), behavior: "smooth" });
  };

  const onCardClick = (realEstate: RealEstate) => {
    // Same 0,0 guard as the markers — without it, clicking one of the
    // un-geocoded listings threw the map into the Atlantic.
    if (!hasRealPosition(realEstate)) return;

    map?.moveCamera({ center: realEstate.address!.position!, zoom: 17 });
    map?.panBy(-250, 0);
  };

  return (
    <div className="h-full w-full relative">
      <GoogleMaps onCreateMap={onCreateMap}>
        <MapMarkers clusters={clusters} map={map} selectedId={realEstateSelected?._id} onSelect={onMarkerSelect} />

        {/* Kept mounted whenever a district is picked, not only while the panel
            is open — otherwise the selection vanished from the map on close. */}
        {isSearchOpen || filter.district.length > 0 ? <DistrictPolygons map={map} districtsWithListings={catalogueDistricts} /> : null}
      </GoogleMaps>

      {/* Offset clears the floating navbar; the map behind it is full-bleed. */}
      <div className="h-[calc(100%-10.5rem)] w-[50rem] max-w-[calc(100%-2rem)] bg-background rounded-[0.8rem] flex flex-col absolute top-[9.5rem] left-[1rem] shadow-lg">
        <Searchbar realEstateList={realEstateList} catalogue={catalogue} />

        {/* space-y rather than a flex column: as flex items in a height-capped
            scroller the cards shrank to a few pixels each. */}
        <div className="min-h-0 grow px-3 py-[1rem] space-y-[1.5rem] overflow-y-auto" ref={listRef}>
          {isLoading && <div className="w-full py-[2rem] text-center italic text-gray-500">Carregando imóveis...</div>}

          {!isLoading && realEstateList.length === 0 && (
            <div className="w-full py-[2rem] text-center italic text-gray-500">Nenhum imóvel encontrado com esses filtros.</div>
          )}

          {realEstateList.map((item) => (
            <RealEstateCard key={`real_estate_card_${item._id}`} realEstate={item} variant="preview" onClickCallback={() => onCardClick(item)} />
          ))}
        </div>
      </div>
    </div>
  );
}
