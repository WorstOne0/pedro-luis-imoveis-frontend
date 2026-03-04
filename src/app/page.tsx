"use client";

// Next
import { useState, useRef } from "react";
import { MarkerF } from "@react-google-maps/api";
import { useApiFetch, useLogEvent } from "@/hooks";
// Store
import { RealEstate } from "@/store/real_estate";
import { useRealEstateStore, useSearchBarStore } from "@/store";
// Components
import { DistrictPolygons, GoogleMaps, RealEstateCard, Searchbar } from "@/components";

import apartament_icon from "@/../public/apartament_icon.png";
import house_icon from "@/../public/house_icon.png";

export default function Home() {
  useLogEvent("page_view", { page: "Home", route: "/" });

  const { realEstateList, setRealEstateList, setRealEstateSelected } = useRealEstateStore((state) => state);
  const { isSearchOpen } = useSearchBarStore((state) => state);

  const { isLoading } = useApiFetch({ url: "http://localhost:4000/real_estate", method: "get" }, setRealEstateList);

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const onCreateMap = (map: google.maps.Map) => setMap(map);

  const createMarkers = (realEstate: RealEstate, index: number) => {
    const icon = {
      url: resolveTypeIcon(realEstate.type).src,
      scaledSize: new window.google.maps.Size(46, 46),
      anchor: new window.google.maps.Point(23, 23),
    };

    return (
      <MarkerF
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

  const resolveTypeIcon = (type: string) => {
    if (type === "apartament") return apartament_icon;
    if (type === "house") return house_icon;

    return apartament_icon;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full relative">
      <GoogleMaps onCreateMap={onCreateMap}>
        {realEstateList.map((item, index) => createMarkers(item, index))}
        {isSearchOpen ? <DistrictPolygons map={map} /> : null}
      </GoogleMaps>

      <div className="h-[calc(100%-2rem)] w-[50rem] bg-background rounded-[0.8rem] flex flex-col absolute top-[1rem] left-[1rem]">
        <Searchbar />

        <div className="min-h-0 grow px-3 overflow-y-auto" ref={listRef}>
          {realEstateList.map((item, index) => (
            <RealEstateCard
              key={`real_estate_card_${index}`}
              realEstate={item}
              onClickCallback={() => {
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
