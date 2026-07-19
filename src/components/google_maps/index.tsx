/* eslint-disable @typescript-eslint/no-unsafe-function-type */

"use client";

// Next
import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import { useDistanceMeasure, DistanceOverlay, DistanceReadout } from "./_components/distance_tool";
//
import { MdOutlineLayers, MdMyLocation, MdOutlineFullscreen, MdAdd, MdRemove, MdCheck } from "react-icons/md";
import { FaCompass } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";

/** One control in the floating map toolbar. */
const MapButton = ({
  label,
  onClick,
  isActive = false,
  children,
}: {
  label: string;
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={isActive}
    onClick={onClick}
    className={`h-[3rem] w-[3rem] flex justify-center items-center rounded-[0.8rem] cursor-pointer transition-colors
      ${isActive ? "bg-white" : "bg-primary filter hover:brightness-130"}`}
  >
    {children}
  </button>
);

// Cascavel/PR — where the map opens when no centre is given.
const DEFAULT_CENTER = { lat: -24.960731, lng: -53.519697 };

interface GoogleMapsProps {
  children?: React.ReactNode;
  onCreateMap?: (map: google.maps.Map) => void;
  height?: string;
  width?: string;
  zoom?: number;
  center?: google.maps.LatLngLiteral;
  gestureHandling?: "auto" | "cooperative" | "greedy" | "none";
  mapTypeId?: string;
  /** The side toolbar only makes sense on the full-page map. */
  showControls?: boolean;
}

// Offered by the layers menu, in the order a broker is most likely to want.
const MAP_TYPES = [
  { value: "hybrid", label: "Satélite com nomes" },
  { value: "satellite", label: "Satélite" },
  { value: "roadmap", label: "Mapa" },
  { value: "terrain", label: "Relevo" },
];

export default function GoogleMaps({
  children,
  onCreateMap,
  height = "100%",
  width = "100%",
  zoom = 13,
  center,
  gestureHandling = "auto",
  mapTypeId = "hybrid",
  showControls = true,
}: GoogleMapsProps) {
  const [myMap, setMyMap] = useState<google.maps.Map | null>(null);
  const [currentMapType, setCurrentMapType] = useState<string>(mapTypeId);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [myLocation, setMyLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState(0);
  const [tilt, setTilt] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const measure = useDistanceMeasure(myMap, isMeasuring);

  // Closing discards the path, so reopening starts clean. Done here rather than
  // in an effect inside the hook, which would be a setState-in-effect cascade.
  const toggleMeasuring = () => {
    if (isMeasuring) measure.clear();

    setIsMeasuring(!isMeasuring);
  };

  // Mirror the camera onto the compass so the needle reflects the real bearing
  // rather than sitting at a decorative north.
  useEffect(() => {
    if (!myMap) return;

    const sync = () => {
      setHeading(myMap.getHeading() ?? 0);
      setTilt(myMap.getTilt() ?? 0);
    };

    const listeners = [myMap.addListener("heading_changed", sync), myMap.addListener("tilt_changed", sync), myMap.addListener("idle", sync)];

    return () => listeners.forEach((listener) => listener.remove());
  }, [myMap]);

  const defaultMapOptions = {
    tilt: 0,
    gestureHandling,
    mapTypeId,
    //
    disableDefaultUI: true,
  };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      map.moveCamera({ center: center ?? DEFAULT_CENTER });

      if (onCreateMap) onCreateMap(map);
      setMyMap(map);
    },
    [onCreateMap, center],
  );

  const selectMapType = (value: string) => {
    myMap?.setOptions({ mapTypeId: value });
    setCurrentMapType(value);
    setIsLayerMenuOpen(false);
  };

  /** Point the camera back at north and flatten it. */
  const resetNorth = () => {
    myMap?.setHeading(0);
    myMap?.setTilt(0);

    setHeading(0);
    setTilt(0);
  };

  const locateMe = () => {
    if (!navigator.geolocation) return setLocationError("Localização não suportada neste navegador.");

    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };

        setMyLocation(point);
        myMap?.moveCamera({ center: point, zoom: 15 });
      },
      // Denying the prompt is a normal outcome, not a crash — say so and move on.
      () => setLocationError("Não foi possível obter sua localização."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) return document.exitFullscreen();

    containerRef.current?.requestFullscreen();
  };

  const zoomBy = (delta: number) => myMap?.setZoom((myMap.getZoom() ?? zoom) + delta);

  return (
    <div className="h-full w-full relative" ref={containerRef}>
      <GoogleMap onLoad={onLoad} mapContainerStyle={{ height, width }} zoom={zoom} options={defaultMapOptions}>
        {children}

        {isMeasuring && <DistanceOverlay points={measure.points} />}

        {myLocation && (
          <MarkerF
            position={myLocation}
            title="Você está aqui"
            icon={{
              url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1a73e8" opacity="0.25"/><circle cx="12" cy="12" r="6" fill="#1a73e8" stroke="#fff" stroke-width="2.5"/></svg>`,
              )}`,
              scaledSize: new window.google.maps.Size(24, 24),
              anchor: new window.google.maps.Point(12, 12),
            }}
          />
        )}
      </GoogleMap>

      {/* Outside <GoogleMap>: as a child it rendered underneath the map's own
          containers and was never visible. */}
      {isMeasuring && (
        <DistanceReadout label={measure.label} count={measure.points.length} onUndo={measure.undo} onClose={toggleMeasuring} />
      )}

      {showControls && (
        <>
          <div className="flex flex-col justify-center items-center gap-[1rem] absolute top-[50%] right-[1rem] transform translate-y-[-50%] z-20">
            <div className="flex flex-col gap-[0.3rem] p-[0.3rem] justify-center items-center bg-primary rounded-[0.8rem] relative">
              <MapButton label="Tipo de mapa" onClick={() => setIsLayerMenuOpen((open) => !open)} isActive={isLayerMenuOpen}>
                <MdOutlineLayers color={isLayerMenuOpen ? "#003b8f" : "white"} size={18} />
              </MapButton>

              {isLayerMenuOpen && (
                <div className="w-[19rem] flex flex-col bg-background border border-border rounded-[1rem] shadow-lg p-[0.4rem] absolute top-0 right-[calc(100%+0.8rem)]">
                  {MAP_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => selectMapType(type.value)}
                      className={`w-full flex items-center justify-between gap-[1rem] text-left text-[1.4rem] rounded-[0.8rem] px-[1.2rem] py-[0.9rem] cursor-pointer
                        ${currentMapType === type.value ? "bg-muted font-semibold" : "hover:bg-muted/60"}`}
                    >
                      {type.label}
                      {currentMapType === type.value && <MdCheck size={16} className="text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              {/* The needle turns with the camera, so it doubles as a bearing
                  readout; clicking it snaps back to north and flat. */}
              <MapButton label={tilt || heading ? "Apontar para o norte" : "Já está apontado para o norte"} onClick={resetNorth}>
                <FaCompass color="white" size={14} style={{ transform: `rotate(${-heading}deg)`, transition: "transform 0.2s" }} />
              </MapButton>
            </div>

            <div className="flex flex-col gap-[0.3rem] p-[0.3rem] justify-center items-center bg-primary rounded-[0.8rem]">
              <MapButton label="Aproximar" onClick={() => zoomBy(1)}>
                <MdAdd color="white" size={20} />
              </MapButton>
              <MapButton label="Afastar" onClick={() => zoomBy(-1)}>
                <MdRemove color="white" size={20} />
              </MapButton>
              <MapButton label="Medir distância" onClick={toggleMeasuring} isActive={isMeasuring}>
                <GiPathDistance color={isMeasuring ? "#003b8f" : "white"} size={16} />
              </MapButton>
            </div>

            <div className="flex flex-col gap-[0.3rem] p-[0.3rem] justify-center items-center bg-primary rounded-[0.8rem]">
              <MapButton label="Minha localização" onClick={locateMe}>
                <MdMyLocation color="white" size={16} />
              </MapButton>
              <MapButton label="Tela cheia" onClick={toggleFullscreen}>
                <MdOutlineFullscreen color="white" size={20} />
              </MapButton>
            </div>
          </div>

          {/* Current layer, so the menu is not the only way to know. */}
          <span className="text-[1.2rem] text-white bg-black/60 rounded-[0.6rem] px-[0.8rem] py-[0.4rem] absolute bottom-[1rem] right-[1rem] select-none pointer-events-none">
            {MAP_TYPES.find((type) => type.value === currentMapType)?.label ?? currentMapType}
          </span>

          {locationError && (
            <span className="text-[1.3rem] text-white bg-black/75 rounded-[0.8rem] px-[1.2rem] py-[0.8rem] absolute bottom-[9rem] left-[50%] translate-x-[-50%] z-20">
              {locationError}
            </span>
          )}
        </>
      )}
    </div>
  );
}
