/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
// Store
import { RealEstate } from "@/store/real_estate";
import { useRealEstateStore } from "@/store";
// Components
import { Card } from "@/components/ui/card";
// Icons
import { MdOutlineBed, MdOutlineShower } from "react-icons/md";
import { FaLocationPin } from "react-icons/fa6";
import { PiGarage } from "react-icons/pi";
import { BiArea } from "react-icons/bi";
import { MdVerified } from "react-icons/md";

export default function RealEstateCard({ realEstate, onClickCallback }: { realEstate: RealEstate; onClickCallback?: Function }) {
  const { realEstateSelected, setRealEstateSelected } = useRealEstateStore((state) => state);
  const router = useRouter();

  const isSelected = realEstateSelected?._id === realEstate._id;

  const handleType = (type: string) => {
    if (type === "house") return "Casa";
    if (type === "apartment") return "Apartamento";
    if (type === "land") return "Terreno";
    if (type === "sobrado") return "Sobrado";
  };

  const handleCardClick = () => {
    if (onClickCallback) onClickCallback();

    if (realEstateSelected?._id === realEstate._id) {
      return router.push(`/real_estate/${realEstate._id}`);
    }

    setRealEstateSelected(realEstate);
  };

  return (
    <Card className={`pb-3 flex flex-col select-none cursor-pointer rounded-[0.8rem] mt-4 relative`} onClick={handleCardClick}>
      {/* Selected */}
      {isSelected && (
        <div
          className="absolute top-0 left-0 h-[4rem] w-[4rem] bg-primary z-10"
          style={{ clipPath: "polygon(0 0,100% 0,0 100%)", borderTopLeftRadius: "0.8rem" }}
        >
          <MdVerified size={18} color="white" className="ml-1 mt-1" />
        </div>
      )}
      {/* Imagem */}
      <div className={`h-[22rem] w-full rounded-[0.8rem] relative`}>
        <img className={`h-[100%] w-[100%] rounded-[0.8rem] object-cover object-center`} src={realEstate.thumbnail} alt="" />
      </div>
      <div className="grow px-5 pt-3 pb-2 bg-white">
        {/* Title */}
        <div className="flex justify-between items-center">
          <span className="text-[2.6rem] font-extrabold">R$ {realEstate.price.toLocaleString()}</span>
          <span className="text-[1.4rem] italic text-gray-600">{handleType(realEstate.type)}</span>
        </div>
        {/* Body */}
        <div className="flex items-center gap-[2rem]">
          {realEstate.rooms > 0 && (
            <div className="h-[2rem] flex items-center">
              <MdOutlineBed size={16} color="#6c757d" className="mr-2" />
              <span className="font-bold text-[1.5rem] text-[#6c757d] mr-1">{realEstate.rooms}</span>
              <span className="font-bold text-[1.5rem] text-[#6c757d]">quartos</span>
            </div>
          )}
          {realEstate.bathrooms > 0 && (
            <div className="h-[2rem] flex items-center">
              <MdOutlineShower size={16} color="#6c757d" className="mr-2" />
              <span className="font-bold text-[1.5rem] text-[#6c757d] mr-1">{realEstate.bathrooms}</span>
              <span className="font-bold text-[1.5rem] text-[#6c757d]">banheiros</span>
            </div>
          )}
          {realEstate.garages > 0 && (
            <div className="h-[2rem] flex items-center">
              <PiGarage size={16} color="#6c757d" className="mr-2" />
              <span className="font-bold text-[1.5rem] text-[#6c757d] mr-1">{realEstate.garages}</span>
              <span className="font-bold text-[1.5rem] text-[#6c757d]">vaga</span>
            </div>
          )}
          {realEstate.area > 0 && (
            <div className="h-[2rem] flex items-center">
              <BiArea size={16} color="#6c757d" className="mr-2" style={{ marginBottom: "1px" }} />
              <span className="font-bold text-[1.5rem] text-[#6c757d]">{realEstate.area} m²</span>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="flex items-center select-text mt-3">
          <FaLocationPin size={12} color="#c53030" className="mr-2" style={{ marginBottom: "1px" }} />
          <span className="text-[#6c757d] text-[1.4rem] italic leading-6">
            {realEstate?.address.street}, {realEstate?.address.number}, {realEstate?.address.district}, {realEstate?.address.city},{" "}
            {realEstate?.address.state}
          </span>
        </div>
      </div>
    </Card>
  );
}
