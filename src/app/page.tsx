"use client";

// Next
import { useState, useRef, useEffect } from "react";
import { MarkerF } from "@react-google-maps/api";
import { useApiFetch, useLogEvent, useDebounce } from "@/hooks";
// Store
import { RealEstate } from "@/store/real_estate";
import { useRealEstateStore, useSearchBarStore } from "@/store";
import { toQueryString } from "@/components/searchbar/store";
// Components
import { DistrictPolygons, GoogleMaps, RealEstateCard, Searchbar } from "@/components";

import apartament_icon from "@/../public/apartament_icon.png";
import house_icon from "@/../public/house_icon.png";
import land_icon from "@/../public/land_icon.png";
import shop_icon from "@/../public/shop_icon.png";
import sobrado_icon from "@/../public/sobrado_icon.png";

// Keys match the type enum in the backend real_estate model.
const TYPE_ICONS: Record<string, typeof apartament_icon> = {
  apartment: apartament_icon,
  house: house_icon,
  land: land_icon,
  shop: shop_icon,
  sobrado: sobrado_icon,
};

export default function Home() {
  useLogEvent("page_view", { page: "Home", route: "/" });

  const { realEstateList, setRealEstateList, setRealEstateSelected, setTotalDocs } = useRealEstateStore((state) => state);
  const { isSearchOpen, filter } = useSearchBarStore((state) => state);

  // Debounced so dragging the price slider does not fire a request per frame.
  const query = useDebounce(toQueryString(filter));
  const { data, isLoading } = useApiFetch({ url: `/real_estate${query}`, method: "get" }, setRealEstateList);

  useEffect(() => setTotalDocs(data?.pagination?.totalDocs ?? null), [data, setTotalDocs]);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const onCreateMap = (map: google.maps.Map) => setMap(map);

  const createMarkers = (realEstate: RealEstate, index: number) => {
    // A listing without coordinates cannot be placed on the map.
    if (!realEstate.address?.position) return null;

    const icon = {
      url: (TYPE_ICONS[realEstate.type] ?? apartament_icon).src,
      scaledSize: new window.google.maps.Size(46, 46),
      anchor: new window.google.maps.Point(23, 23),
    };

    return (
      <MarkerF
        key={`marker_${realEstate._id}`}
        position={realEstate.address.position}
        icon={icon}
        clickable={true}
        onClick={() => {
          setRealEstateSelected(realEstate);
          listRef.current?.scrollTo({ top: index * (330 + 10), behavior: "smooth" });
        }}
      />
    );
  };

  return (
    <div className="h-full w-full relative">
      <GoogleMaps onCreateMap={onCreateMap}>
        {realEstateList.map((item, index) => createMarkers(item, index))}
        {isSearchOpen ? <DistrictPolygons map={map} /> : null}
      </GoogleMaps>

      <div className="h-[calc(100%-2rem)] w-[50rem] max-w-[calc(100%-2rem)] bg-background rounded-[0.8rem] flex flex-col absolute top-[1rem] left-[1rem]">
        <Searchbar />

        <div className="min-h-0 grow px-3 overflow-y-auto" ref={listRef}>
          {isLoading && <div className="w-full py-[2rem] text-center italic text-gray-500">Carregando imóveis...</div>}

          {!isLoading && realEstateList.length === 0 && (
            <div className="w-full py-[2rem] text-center italic text-gray-500">Nenhum imóvel encontrado com esses filtros.</div>
          )}

          {realEstateList.map((item) => (
            <RealEstateCard
              key={`real_estate_card_${item._id}`}
              realEstate={item}
              onClickCallback={() => {
                if (!item.address?.position) return;

                map?.moveCamera({ center: item.address.position, zoom: 17 });
                map?.panBy(-250, 0);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
