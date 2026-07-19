/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Next
import { useMemo, useState } from "react";
import { PolygonF } from "@react-google-maps/api";
// Store
import { useSearchBarStore } from "@/store";
import { isDistrictSelected, normalizeDistrict, toDistrictLabel } from "@/app/(home)/_components/searchbar/store";
// Utils
import districtsGeo from "@/utils/districts_geo";

type District = { name: string; color: string; geometry: any };

const toPath = (district: District) => district.geometry.coordinates.map((point: any) => ({ lat: point[1], lng: point[0] }));

/**
 * District outlines over the map.
 *
 * One rule: a district is drawn when it is selected. With nothing selected the
 * filter means "every district", so every outline is drawn — which is also the
 * starting state.
 *
 * Clicking a shape selects that district alone; clicking it again clears the
 * filter and brings all the outlines back. Selecting several at once is the
 * multiselect's job, and this reads from the same filter.district list, so the
 * two stay in step.
 */
export default function DistrictPolygons({ map, districtsWithListings = [] }: { map: google.maps.Map | null; districtsWithListings?: string[] }) {
  const selected = useSearchBarStore((state) => state.filter.district);
  const setFilter = useSearchBarStore((state) => state.setFilter);

  const [hovered, setHovered] = useState("");

  // The polygon data and the listings spell districts differently. Keying by the
  // normalised name lets a click resolve to the spelling the listings use, which
  // is what the API needs to match on.
  const listingNameByKey = useMemo(() => {
    const names = new Map<string, string>();
    districtsWithListings.forEach((district) => names.set(normalizeDistrict(district), district));

    return names;
  }, [districtsWithListings]);

  const fitTo = (paths: google.maps.LatLngLiteral[]) => {
    const bounds = new window.google.maps.LatLngBounds();
    paths.forEach((point) => bounds.extend(point));

    map?.fitBounds(bounds, { left: 500 });
  };

  const handleClick = (district: District) => {
    // Clicking the district that is already the only selection clears it, and
    // the map goes back to showing the whole city.
    if (isDistrictSelected(selected, district.name)) {
      setFilter({ district: [] });
      fitTo(districtsGeo.districts.flatMap((item: District) => toPath(item)));

      return;
    }

    // Otherwise the map selects one district at a time — replacing, not adding.
    setFilter({ district: [listingNameByKey.get(normalizeDistrict(district.name)) ?? toDistrictLabel(district.name)] });
    fitTo(toPath(district));
  };

  const createPolygon = (district: District) => {
    const isHovered = hovered === district.name;
    const color = isHovered ? "#FF0000" : "#0000FF";

    return (
      <PolygonF
        key={district.name}
        paths={toPath(district)}
        onClick={() => handleClick(district)}
        onMouseOver={() => setHovered(district.name)}
        onMouseOut={() => setHovered("")}
        options={{
          clickable: true,
          fillColor: color,
          fillOpacity: 0.18,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 3,
          zIndex: isHovered ? 10 : 2,
        }}
      />
    );
  };

  const visible =
    selected.length > 0 ? districtsGeo.districts.filter((district: District) => isDistrictSelected(selected, district.name)) : districtsGeo.districts;

  return visible.map((district: District) => createPolygon(district));
}
