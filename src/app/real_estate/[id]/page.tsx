/* eslint-disable @next/next/no-img-element */
"use client";

// Next
import Link from "next/link";
// Hooks
import { useApiFetch, useLogEvent } from "@/hooks";
// Store
import { useRealEstateStore } from "@/store";
// Components
import { Card, Slideshow } from "@/components";
import { SlideshowHandle } from "@/components/slideshow";
// Icons
import { FaWhatsapp, FaArrowLeft, FaBed, FaBath } from "react-icons/fa";
import { MdDescription, MdShare } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { PiGarage } from "react-icons/pi";
import { GiExpand } from "react-icons/gi";
import { useRef, use } from "react";

export default function RealEstatePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  useLogEvent("page_view", { page: "RealEstatePage", route: `/real_estate/${params.id}` });

  const { realEstateSelected, setRealEstateSelected } = useRealEstateStore((state) => state);
  const { isLoading } = useApiFetch({ url: `/real_estate/${params.id}`, method: "get" }, setRealEstateSelected);

  const slideshowRef = useRef<SlideshowHandle>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!realEstateSelected) {
    return <div>Loading...</div>;
  }

  // A listing can have anywhere from zero to ten photos, so the side column is
  // driven off what actually exists rather than fixed images[0]/images[1].
  const gallery = realEstateSelected.images ?? [];
  const remaining = Math.max(gallery.length - 2, 0);

  return (
    <div className="max-h-full w-full p-[1.5rem] flex flex-col overflow-y-auto">
      {/* Slideshow */}
      <Slideshow ref={slideshowRef} images={[realEstateSelected.thumbnail, ...gallery].filter(Boolean)} />

      {/* Image */}
      <div className={`min-h-[50vh] w-full flex justify-between`}>
        <div className={`min-h-[50vh] w-[85%] rounded-[0.8rem]  relative cursor-pointer`} onClick={() => slideshowRef.current?.openSlideshow(0)}>
          <img className={`h-[100%] w-[100%] rounded-[0.8rem] object-cover object-center`} src={realEstateSelected.thumbnail} alt="" />
          <Link
            href={"/"}
            className="h-[4rem] w-[4rem] absolute top-[1rem] left-[1rem] bg-background rounded-[0.8rem] cursor-pointer flex justify-center items-center"
          >
            <FaArrowLeft size={15} />
          </Link>
        </div>
        {/* Side thumbnails only make sense once there are extra photos to show */}
        {gallery.length > 0 && (
          <div className={`min-h-[50vh] w-[15%] rounded-[0.8rem] flex flex-col justify-between ml-[1.5rem]`}>
            {gallery.slice(0, 2).map((image, index) => (
              <div
                key={`gallery_${index}`}
                className={`h-[32%] w-[100%] rounded-[0.8rem] relative cursor-pointer`}
                onClick={() => slideshowRef.current?.openSlideshow(index + 1)}
              >
                <img className={`h-[100%] w-[100%] rounded-[0.8rem] object-cover object-center`} src={image} alt="" />
              </div>
            ))}

            {remaining > 0 && (
              <div className={`h-[32%] w-[100%] rounded-[0.8rem] overflow-hidden relative`}>
                <div className={`h-[100%] w-[100%] rounded-[0.8rem] relative cursor-pointer`} onClick={() => slideshowRef.current?.openSlideshow(3)}>
                  <img
                    className={`h-[100%] w-[100%] rounded-[0.8rem] object-cover object-center`}
                    style={{ filter: "blur(8px)" }}
                    src={gallery[2]}
                    alt=""
                  />
                </div>
                <div className="flex flex-col absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] select-none pointer-events-none">
                  <span className="text-[2.2rem] font-bold text-center text-white" style={{ textShadow: "0 0 4px #000" }}>
                    +{remaining}
                  </span>
                  <span className="text-[1.4rem] font-bold text-center text-white" style={{ textShadow: "0 0 4px #000" }}>
                    Ver todas as fotos
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="min-h-[100rem] h-[100rem] flex mt-[1.5rem]">
        {/* Left */}
        <div className="h-full min-w-0 grow px-[1.5rem]">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center">
              <MdDescription size={24} className="mr-2" />
              <span className="font-bold text-[2.6rem]">Descrição</span>
            </div>
            <div className="text-gray-500 text-[1.6rem] italic"></div>
          </div>
          <p className="mt-[1.5rem] text-justify text-gray-800 dark:text-white">{realEstateSelected.description}</p>

          <div className="mt-[3rem] w-full flex justify-between items-center">
            <div className="flex items-center">
              <FaLocationDot size={24} className="mr-2" />
              <span className="font-bold text-[2.6rem]">Endereço</span>
            </div>
            <div className="text-[1.6rem] italic text-gray-500 dark:text-white">
              {realEstateSelected.address.street}, {realEstateSelected.address.number}, {realEstateSelected.address.district},{" "}
              {realEstateSelected.address.city}, {realEstateSelected.address.state}
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-[1.5rem] mt-[1.5rem]">
            <Card className="flex justify-between items-center px-[1.5rem] py-[0.5rem]">
              <span className="font-bold">Cidade</span>
              <span className="italic">{realEstateSelected.address.city}</span>
            </Card>
            <Card className="flex justify-between items-center px-[1.5rem] py-[0.5rem]">
              <span className="font-bold">Estado</span>
              <span className="italic">{realEstateSelected.address.state}</span>
            </Card>
            <Card className="flex justify-between items-center px-[1.5rem] py-[0.5rem]">
              <span className="font-bold">CEP</span>
              <span className="italic">{realEstateSelected.address.cep}</span>
            </Card>
            <Card className="flex justify-between items-center px-[1.5rem] py-[0.5rem]">
              <span className="font-bold">Bairro</span>
              <span className="italic">{realEstateSelected.address.district}</span>
            </Card>
            <Card className="flex justify-between items-center px-[1.5rem] py-[0.5rem]">
              <span className="font-bold">Rua</span>
              <span className="italic">{realEstateSelected.address.street}</span>
            </Card>
            <Card className="flex justify-between items-center px-[1.5rem] py-[0.5rem]">
              <span className="font-bold">Número / Comp.</span>
              <span className="italic">
                {realEstateSelected.address.number}
                {realEstateSelected.address.complement ? ` / ${realEstateSelected.address.complement}` : ""}
              </span>
            </Card>
          </div>
        </div>

        {/* Right */}
        <div className="h-full min-w-[50rem] ml-[1.5rem] relative">
          <Card className="h-[30rem] w-full flex flex-col p-[1.5rem] sticky top-0">
            <div className="min-h-0 grow flex flex-col">
              <div className="flex justify-between">
                <span className="font-bold text-[2.2rem]">Informações</span>
                <span className="text-gray-500 text-[1.4rem] italic">
                  {realEstateSelected.createdAt ? `Criado as ${new Date(realEstateSelected.createdAt).toLocaleDateString("pt-BR")}` : ""}
                </span>
              </div>

              <div className="min-h-0 grow flex flex-col justify-center items-center">
                <span className="text-[1.6rem] italic">Valor do imóvel</span>
                <span className="text-[3.6rem] font-extrabold tracking-widest">R$ {realEstateSelected.price.toLocaleString()}</span>
              </div>

              <Card className="flex justify-center py-[0.5rem] dark:bg-secondary">
                <div className="flex items-center px-[1rem]">
                  <FaBed size={16} color="text-foreground" className="mr-2" />
                  <span>{realEstateSelected.rooms}</span>
                </div>
                <div className="flex items-center px-[1rem]">
                  <FaBath size={16} color="text-foreground" className="mr-2" />
                  <span>{realEstateSelected.bathrooms}</span>
                </div>
                <div className="flex items-center px-[1rem]">
                  <PiGarage size={16} color="text-foreground" className="mr-2" />
                  <span>{realEstateSelected.garages}</span>
                </div>
                <div className="flex items-center px-[1rem]">
                  <GiExpand size={16} color="text-foreground" className="mr-2" />
                  <span>{realEstateSelected.area}m²</span>
                </div>
              </Card>
            </div>

            <div className="h-[5rem] w-full flex mt-[1.5rem]">
              <Card className="min-w-0 grow flex justify-center items-center dark:bg-secondary rounded-[0.8rem]">
                <FaWhatsapp size={20} />
                <span className="font-bold text-[1.6rem] ml-[1rem]">Contato</span>
              </Card>
              <Card className="w-[5rem] flex justify-center items-center rounded-[0.8rem] ml-[1.5rem] dark:bg-secondary">
                <MdShare size={18} />
              </Card>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
