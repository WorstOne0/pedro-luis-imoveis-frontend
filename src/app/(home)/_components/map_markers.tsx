"use client";

import { MarkerF } from "@react-google-maps/api";
// Store
import type { RealEstate } from "@/store/real_estate";
// Utils
import { buildMarkerIcon, MARKER_SIZE } from "@/lib/map_marker";
import { buildClusterIcon, type Cluster } from "./use_marker_clusters";

const clusterSize = (count: number) => (count < 10 ? 44 : count < 100 ? 52 : 60);

/**
 * The markers layer. Must be rendered as a child of <GoogleMaps>.
 *
 * A cluster draws a count bubble; a lone listing draws its type pin. Clicking a
 * cluster fits its members rather than stepping the zoom, so one click always
 * opens it however tightly packed it is.
 */
export default function MapMarkers({
  clusters,
  map,
  selectedId,
  onSelect,
}: {
  clusters: Cluster[];
  map: google.maps.Map | null;
  selectedId?: string;
  onSelect: (realEstate: RealEstate) => void;
}) {
  const createMarker = (cluster: Cluster) => {
    if (cluster.items.length > 1) {
      const size = clusterSize(cluster.items.length);

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
            const bounds = new window.google.maps.LatLngBounds();
            cluster.items.forEach((item) => bounds.extend(item.address!.position!));

            map?.fitBounds(bounds, 80);
          }}
        />
      );
    }

    const realEstate = cluster.items[0];
    const isSelected = selectedId === realEstate._id;

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
        onClick={() => onSelect(realEstate)}
      />
    );
  };

  return clusters.map((cluster) => createMarker(cluster));
}
