/* eslint-disable @typescript-eslint/no-unsafe-function-type */

"use client";

// Next
import { useState, useCallback } from "react";
import { GoogleMap } from "@react-google-maps/api";
//
import { MdOutlineLayers, MdMyLocation, MdOutlineFullscreen } from "react-icons/md";
import { FaCompass, FaSearch } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";
import { FaDrawPolygon } from "react-icons/fa";
import { MdOutlineLocalFireDepartment } from "react-icons/md";
import { PiMountainsFill } from "react-icons/pi";

interface GoogleMapsProps {
  children?: React.ReactNode;
  onCreateMap?: Function;
  height?: string;
  width?: string;
}

export default function GoogleMaps({ children, onCreateMap, height = "100%", width = "100%" }: GoogleMapsProps) {
  const [myMap, setMyMap] = useState<google.maps.Map | null>(null);

  const defaultMapZoom = 13;
  const defaultMapOptions = {
    tilt: 0,
    gestureHandling: "auto",
    mapTypeId: "hybrid",
    //
    disableDefaultUI: true,
  };

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      map.moveCamera({ center: { lat: -24.960731, lng: -53.519697 } });

      if (onCreateMap) onCreateMap(map);
      setMyMap(map);
    },
    [onCreateMap],
  );

  return (
    <div className="h-full w-full relative">
      <GoogleMap onLoad={onLoad} mapContainerStyle={{ height, width }} zoom={defaultMapZoom} options={defaultMapOptions}>
        {children}
      </GoogleMap>

      <div className="flex flex-col justify-center items-center gap-[1rem] absolute top-[50%] right-[1rem] transform translate-y-[-50%]">
        <div className="flex flex-col gap-[0.3rem] p-[0.3rem] justify-center items-center bg-primary rounded-[0.8rem]">
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {
              myMap?.setOptions({ mapTypeId: "roadmap" });
            }}
          >
            <MdOutlineLayers color="white" size={18} />
          </div>
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <FaCompass color="white" size={14} />
          </div>
        </div>

        <div className="flex flex-col gap-[0.3rem] p-[0.3rem] justify-center items-center bg-primary rounded-[0.8rem]">
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <FaSearch color="white" size={14} />
          </div>
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <GiPathDistance color="white" size={16} />
          </div>
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <FaDrawPolygon color="white" size={14} />
          </div>
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <MdOutlineLocalFireDepartment color="white" size={16} />
          </div>
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <PiMountainsFill color="white" size={14} />
          </div>
        </div>

        <div className="flex flex-col gap-[0.3rem] p-[0.3rem] justify-center items-center bg-primary rounded-[0.8rem]">
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <MdMyLocation color="white" size={16} />
          </div>
          <div
            className="h-[3rem] w-[3rem] flex justify-center items-center bg-primary rounded-[0.8rem] filter hover:brightness-130 cursor-pointer"
            onClick={() => {}}
          >
            <MdOutlineFullscreen color="white" size={20} />
          </div>
        </div>
      </div>

      {/** map layer, compass -- search, distance, polygon, heatmap, elevation -- my location, fullscreen */}
      {/** bottom rigth, lat lng */}
    </div>
  );
}
