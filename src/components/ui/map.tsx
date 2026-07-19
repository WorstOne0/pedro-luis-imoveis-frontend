"use client";

import * as React from "react";
import Map, { Marker, NavigationControl, type MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

/**
 * mapcn-style map, built on MapLibre + react-map-gl.
 *
 * Deliberately not Google Maps: this only needs to show one pin, and MapLibre
 * renders vector tiles without an API key or per-load billing. The full-screen
 * listing map still uses Google.
 *
 * Tiles come from OpenFreeMap (free, no key, no signup). Swap STYLES for a
 * MapTiler/Carto url if you ever want a different look.
 */
const STYLES = {
  light: "https://tiles.openfreemap.org/styles/bright",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;

export interface MapViewProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  theme?: keyof typeof STYLES;
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
}

export function MapView({ latitude, longitude, zoom = 15, theme = "light", className, children, interactive = true }: MapViewProps) {
  const mapRef = React.useRef<MapRef>(null);

  // Recentre when the listing changes without remounting the whole canvas.
  React.useEffect(() => {
    mapRef.current?.easeTo({ center: [longitude, latitude], zoom, duration: 400 });
  }, [latitude, longitude, zoom]);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl border border-border", className)}>
      <Map
        ref={mapRef}
        initialViewState={{ latitude, longitude, zoom }}
        mapStyle={STYLES[theme]}
        style={{ width: "100%", height: "100%" }}
        // Scroll-zoom would otherwise trap the page scroll on a mid-page map.
        scrollZoom={false}
        dragRotate={false}
        interactive={interactive}
        attributionControl={false}
      >
        {interactive && <NavigationControl position="top-right" showCompass={false} />}
        {children}
      </Map>
    </div>
  );
}

/** Pin styled to match the app rather than MapLibre's default. */
export function MapPin({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <Marker latitude={latitude} longitude={longitude} anchor="bottom">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
        <span className="relative inline-flex h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
      </span>
    </Marker>
  );
}
