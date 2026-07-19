"use client";

import { useEffect, useState } from "react";
import type { RealEstate } from "@/store/real_estate";

export type Cluster = {
  key: string;
  position: google.maps.LatLngLiteral;
  items: RealEstate[];
};

// Roughly one cluster per 70px of screen. Smaller packs pins tighter before
// merging; larger collapses more aggressively.
const CELL_PX = 70;

// Past this zoom the broker is looking at a street, not a region, so show every
// pin even if they overlap.
const MAX_CLUSTER_ZOOM = 16;

/**
 * True only for a coordinate that means something.
 *
 * The legacy import wrote {lat: 0, lng: 0} for records that had no coordinates
 * rather than leaving them unset, so a plain null check passes them through and
 * they land in the Atlantic off Africa. Most of the catalogue is in that state.
 */
export const hasRealPosition = (realEstate: RealEstate) => {
  const position = realEstate.address?.position;
  if (!position) return false;

  return Number.isFinite(position.lat) && Number.isFinite(position.lng) && !(position.lat === 0 && position.lng === 0);
};

/** Same buckets holding the same listings — nothing for React to re-render. */
const isSameGrouping = (a: Cluster[], b: Cluster[]) =>
  a.length === b.length && a.every((cluster, index) => cluster.key === b[index].key && cluster.items.length === b[index].items.length);

/**
 * Groups listings into screen-space clusters.
 *
 * A grid clusterer rather than a library: at this catalogue size the difference
 * is imperceptible, and it keeps the map free of another dependency. Listings
 * are projected to world pixels at the current zoom and bucketed by cell, so
 * two pins merge exactly when they would visually collide.
 */
export const useMarkerClusters = (map: google.maps.Map | null, realEstateList: RealEstate[]) => {
  const [clusters, setClusters] = useState<Cluster[]>([]);

  useEffect(() => {
    if (!map) return;

    const rebuild = () => {
      const projection = map.getProjection();
      const zoom = map.getZoom();

      // The projection only exists once the map has finished initialising.
      if (!projection || zoom === undefined) return;

      const placed = realEstateList.filter(hasRealPosition);

      if (zoom >= MAX_CLUSTER_ZOOM) {
        setClusters(placed.map((item) => ({ key: item._id, position: item.address!.position!, items: [item] })));
        return;
      }

      const scale = 2 ** zoom;
      const buckets = new Map<string, RealEstate[]>();

      for (const item of placed) {
        const position = item.address!.position!;
        const world = projection.fromLatLngToPoint(new google.maps.LatLng(position.lat, position.lng));
        if (!world) continue;

        const cellX = Math.floor((world.x * scale) / CELL_PX);
        const cellY = Math.floor((world.y * scale) / CELL_PX);
        const key = `${cellX}:${cellY}`;

        buckets.set(key, [...(buckets.get(key) ?? []), item]);
      }

      const next: Cluster[] = [];

      for (const [key, items] of buckets) {
        // A single listing keeps its own coordinates; a cluster sits at the
        // average of its members so it lands among them rather than on a
        // grid line.
        if (items.length === 1) {
          next.push({ key: items[0]._id, position: items[0].address!.position!, items });
          continue;
        }

        const lat = items.reduce((sum, item) => sum + item.address!.position!.lat, 0) / items.length;
        const lng = items.reduce((sum, item) => sum + item.address!.position!.lng, 0) / items.length;

        next.push({ key: `cluster_${key}`, position: { lat, lng }, items });
      }

      // Only replace state when the grouping actually changed. Every rebuild
      // produces a fresh array, so without this an effect that re-runs per
      // render (an unstable input) turns into an update loop.
      setClusters((current) => (isSameGrouping(current, next) ? current : next));
    };

    rebuild();

    // `idle` covers pan, zoom and resize once movement settles, which is the
    // only time the grid can change.
    const listener = map.addListener("idle", rebuild);

    return () => listener.remove();
  }, [map, realEstateList]);

  return clusters;
};

/** Cluster bubble: a count in a brand-coloured disc, matching the pin styling. */
export const buildClusterIcon = (count: number) => {
  const size = count < 10 ? 44 : count < 100 ? 52 : 60;
  const radius = size / 2 - 3;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs><filter id="c" x="-50%" y="-50%" width="200%" height="200%">
<feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35"/>
</filter></defs>
<circle cx="${size / 2}" cy="${size / 2}" r="${radius + 3}" fill="#003b8f" opacity="0.25"/>
<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="#003b8f" stroke="#111827" stroke-width="2.5" filter="url(#c)"/>
<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="sans-serif" font-size="${
    count < 100 ? 16 : 14
  }" font-weight="700">${count}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
