"use client";

// Next
import { useState, useRef, useMemo } from "react";
import { MarkerF } from "@react-google-maps/api";
import { useApiFetch, useLogEvent, useDebounce } from "@/hooks";
// Store
import { RealEstate } from "@/store/real_estate";
import { useRealEstateStore, useSearchBarStore } from "@/store";
import { toQueryString } from "./_components/searchbar/store";
// Components
import { DistrictPolygons, GoogleMaps } from "@/components";
import Searchbar from "./_components/searchbar";
import RealEstateCard from "@/app/(home)/_components/real_estate_card";

import { buildMarkerIcon, MARKER_SIZE } from "@/lib/map_marker";
import { useMarkerClusters, buildClusterIcon, hasRealPosition, type Cluster } from "./_components/use_marker_clusters";

// Module scope so the reference is stable across renders.
const EMPTY: RealEstate[] = [];

export default function Home() {
  useLogEvent("page_view", { page: "Home", route: "/" });

  const filter = useSearchBarStore((state) => state.filter);
  const isSearchOpen = useSearchBarStore((state) => state.isSearchOpen);
  const setRealEstateSelected = useRealEstateStore((state) => state.setRealEstateSelected);
  const realEstateSelected = useRealEstateStore((state) => state.realEstateSelected);

  // Debounced so dragging the price slider does not fire a request per frame.
  const query = useDebounce(toQueryString(filter));
  const { data, isLoading } = useApiFetch<RealEstate[]>(`/real_estate${query}`);

  // The unfiltered catalogue, used only for the price histogram's fixed
  // bounds. With no filters applied this is the same SWR key as the list above,
  // so it costs nothing; once filtered, SWR serves it from cache.
  const { data: catalogueData } = useApiFetch<RealEstate[]>("/real_estate");

  // `?? EMPTY`, never `= []`: a literal default builds a new array on every
  // render, and that reference feeds the clustering effect's deps — it re-ran
  // each render, set state, and re-rendered, which is the "Maximum update
  // depth exceeded" loop.
  const realEstateList = data ?? EMPTY;
  const catalogue = catalogueData ?? EMPTY;

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

  const createMarker = (cluster: Cluster) => {
    // Several listings in one screen cell — draw the count instead of a pile of
    // overlapping pins.
    if (cluster.items.length > 1) {
      const size = cluster.items.length < 10 ? 44 : cluster.items.length < 100 ? 52 : 60;

      return (
        <MarkerF
          key={cluster.key}
          position={cluster.position}
          icon={{
            url: buildClusterIcon(cluster.items.length),
            scaledSize: new window.google.maps.Size(size, size),
            anchor: new window.google.maps.Point(size / 2, size / 2),
          }}
          zIndex={5}
          onClick={() => {
            // Fit the members rather than stepping the zoom: one click always
            // opens the cluster, however tightly packed it is.
            const bounds = new window.google.maps.LatLngBounds();
            cluster.items.forEach((item) => bounds.extend(item.address!.position!));

            map?.fitBounds(bounds, 80);
          }}
        />
      );
    }

    const realEstate = cluster.items[0];
    const isSelected = realEstateSelected?._id === realEstate._id;
    const index = realEstateList.findIndex((item) => item._id === realEstate._id);

    return (
      <MarkerF
        key={cluster.key}
        position={cluster.position}
        icon={{
          url: buildMarkerIcon({ type: realEstate.type, isSelected }),
          scaledSize: new window.google.maps.Size(MARKER_SIZE, MARKER_SIZE),
          anchor: new window.google.maps.Point(MARKER_SIZE / 2, MARKER_SIZE / 2),
        }}
        // Lift the selected pin above its neighbours so the ring is not
        // half-hidden under an overlapping marker.
        zIndex={isSelected ? 10 : undefined}
        clickable={true}
        onClick={() => {
          setRealEstateSelected(realEstate);
          if (index >= 0) listRef.current?.scrollTo({ top: index * (330 + 10), behavior: "smooth" });
        }}
      />
    );
  };

  return (
    <div className="h-full w-full relative">
      <GoogleMaps onCreateMap={onCreateMap}>
        {clusters.map((cluster) => createMarker(cluster))}
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
            <RealEstateCard
              key={`real_estate_card_${item._id}`}
              realEstate={item}
              // Shared with the dashboard's listing grid and form preview.
              variant="preview"
              onClickCallback={() => {
                // Same 0,0 guard as the markers — without it, clicking one of
                // the un-geocoded listings threw the map into the Atlantic.
                if (!hasRealPosition(item)) return;

                map?.moveCamera({ center: item.address!.position!, zoom: 17 });
                map?.panBy(-250, 0);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
