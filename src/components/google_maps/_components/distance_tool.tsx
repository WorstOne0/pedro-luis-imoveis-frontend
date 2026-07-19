"use client";

import { useEffect, useState } from "react";
import { MarkerF, PolylineF } from "@react-google-maps/api";
//
import { MdClose, MdUndo } from "react-icons/md";

/** Metres for short runs, kilometres once it stops being readable. */
const formatDistance = (metres: number) => {
  if (metres < 1000) return `${Math.round(metres)} m`;

  return `${(metres / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km`;
};

const vertexIcon = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5" fill="#fff" stroke="#003b8f" stroke-width="2.5"/></svg>`
)}`;

/**
 * Click-to-measure ruler.
 *
 * Split deliberately in three: the state lives in the parent, the polyline and
 * vertices render *inside* <GoogleMap>, and the readout renders *outside* it.
 * Google injects its own containers into the map element at very high
 * z-indexes, so an HTML panel placed among the map's children is drawn but
 * buried — the markers looked fine while the total was invisible.
 */
export const useDistanceMeasure = (map: google.maps.Map | null, isActive: boolean) => {
  const [points, setPoints] = useState<google.maps.LatLngLiteral[]>([]);

  useEffect(() => {
    if (!map || !isActive) return;

    const listener = map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      setPoints((current) => [...current, { lat: event.latLng!.lat(), lng: event.latLng!.lng() }]);
    });

    // The crosshair is the affordance that the map is in measuring mode.
    const previousCursor = map.get("draggableCursor");
    map.setOptions({ draggableCursor: "crosshair" });

    return () => {
      listener.remove();
      map.setOptions({ draggableCursor: previousCursor ?? null });
    };
  }, [map, isActive]);

  const total = points.reduce((sum, point, index) => {
    if (index === 0) return 0;

    const from = new google.maps.LatLng(points[index - 1]);
    const to = new google.maps.LatLng(point);

    return sum + google.maps.geometry.spherical.computeDistanceBetween(from, to);
  }, 0);

  return {
    points,
    total,
    label: formatDistance(total),
    undo: () => setPoints((current) => current.slice(0, -1)),
    clear: () => setPoints([]),
  };
};

/** Path and vertices. Must be rendered as a child of <GoogleMap>. */
export const DistanceOverlay = ({ points }: { points: google.maps.LatLngLiteral[] }) => (
  <>
    <PolylineF path={points} options={{ strokeColor: "#003b8f", strokeWeight: 4, strokeOpacity: 0.9, clickable: false }} />

    {points.map((point, index) => (
      <MarkerF
        key={`measure_${index}`}
        position={point}
        icon={{ url: vertexIcon, scaledSize: new google.maps.Size(16, 16), anchor: new google.maps.Point(8, 8) }}
        zIndex={20}
        clickable={false}
      />
    ))}
  </>
);

/** Running total. Must be rendered *outside* <GoogleMap>, above the map. */
export const DistanceReadout = ({
  label,
  count,
  onUndo,
  onClose,
}: {
  label: string;
  count: number;
  onUndo: () => void;
  onClose: () => void;
}) => (
  // Bottom, not top: the site's floating navbar is fixed at z-50 over the top
  // of the map, and a readout up there is covered by it.
  <div className="flex items-center gap-[1.2rem] bg-black/80 text-white rounded-[1rem] px-[1.4rem] py-[1rem] absolute bottom-[2rem] left-[50%] translate-x-[-50%] z-20">
    <div className="flex flex-col">
      <span className="text-[1.8rem] font-bold leading-[2.2rem]">{label}</span>
      <span className="text-[1.2rem] opacity-75">
        {count === 0 ? "Clique no mapa para medir" : `${count} ponto${count === 1 ? "" : "s"}`}
      </span>
    </div>

    <button
      type="button"
      aria-label="Desfazer último ponto"
      title="Desfazer último ponto"
      onClick={onUndo}
      disabled={count === 0}
      className="h-[3rem] w-[3rem] flex justify-center items-center rounded-[0.8rem] hover:bg-white/15 disabled:opacity-40 cursor-pointer"
    >
      <MdUndo size={18} />
    </button>

    <button
      type="button"
      aria-label="Fechar medição"
      title="Fechar medição"
      onClick={onClose}
      className="h-[3rem] w-[3rem] flex justify-center items-center rounded-[0.8rem] hover:bg-white/15 cursor-pointer"
    >
      <MdClose size={18} />
    </button>
  </div>
);
