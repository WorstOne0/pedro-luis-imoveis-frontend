"use client";

// Next
import { useRef } from "react";
import { useTheme } from "next-themes";
// Hooks
import { useApiFetch, useLogEvent } from "@/hooks";
// Store
import { RealEstate } from "@/store/real_estate";
// Components
import { Slideshow } from "@/components";
import { MapView, MapPin } from "@/components/ui/map";
import { SlideshowHandle } from "@/components/slideshow";
import RealEstateCard from "@/app/(home)/_components/real_estate_card";
import Gallery from "./gallery";
import ContactCard from "./contact_card";
// Icons
import { FaBed, FaBath } from "react-icons/fa";
import { MdDescription, MdCheck } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { PiGarage } from "react-icons/pi";
import { GiExpand } from "react-icons/gi";

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  land: "Terreno",
  shop: "Comercial",
  sobrado: "Sobrado",
};

const SALE_LABELS: Record<string, string> = { sell: "Venda", rent: "Aluguel", both: "Venda/Aluguel" };

/**
 * The interactive half of the listing page. It lives apart from page.tsx so
 * that page.tsx can stay a server component and export generateMetadata —
 * "use client" silently disables metadata, which left every shared listing link
 * falling back to the site-wide preview.
 */
export default function DetailView({ id }: { id: string }) {
  useLogEvent("page_view", { page: "RealEstatePage", route: `/real_estate/${id}` });

  const { data: realEstate, isLoading, error } = useApiFetch<RealEstate>(`/real_estate/${id}`);

  // Similar = same type, excluding this listing. Skipped until the listing
  // loads, since the type is part of the query.
  const { data: similar = [] } = useApiFetch<RealEstate[]>(
    realEstate ? `/real_estate?type=${realEstate.type}&exclude=${realEstate._id}&limit=3` : null
  );

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const slideshowRef = useRef<SlideshowHandle>(null);

  if (isLoading) {
    return <div className="w-full p-[3rem] text-center italic text-gray-500">Carregando imóvel...</div>;
  }

  if (error || !realEstate) {
    return <div className="w-full p-[3rem] text-center italic text-gray-500">Imóvel não encontrado.</div>;
  }

  const address = realEstate.address;
  const images = [realEstate.thumbnail, ...(realEstate.images ?? [])].filter(Boolean);
  const features = realEstate.features ?? [];

  const stats = [
    { key: "rooms", Icon: FaBed, value: realEstate.rooms, label: realEstate.rooms === 1 ? "quarto" : "quartos" },
    { key: "bathrooms", Icon: FaBath, value: realEstate.bathrooms, label: realEstate.bathrooms === 1 ? "banheiro" : "banheiros" },
    { key: "garages", Icon: PiGarage, value: realEstate.garages, label: realEstate.garages === 1 ? "vaga" : "vagas" },
    { key: "area", Icon: GiExpand, value: realEstate.area, label: "m²" },
  ].filter((stat) => Number(stat.value) > 0);

  const listingTitle = realEstate.title?.trim() || `${TYPE_LABELS[realEstate.type] ?? "Imóvel"} no ${address?.district ?? "Cascavel"}`;

  const fullAddress = [address?.street, address?.number, address?.district].filter(Boolean).join(", ");
  const cityLine = [address?.city, address?.state].filter(Boolean).join(", ");

  return (
    <div className="h-full w-full overflow-y-auto">
      {/* 192rem = 1920px at the 62.5% root size, so the page fills a full HD
          screen instead of stopping at 1440. */}
      <div className="w-full max-w-[192rem] mx-auto px-[2rem] pt-[9.5rem] pb-[3rem] flex flex-col">
        <Slideshow ref={slideshowRef} images={images} />

        <Gallery images={images} title={listingTitle} onOpen={(index) => slideshowRef.current?.openSlideshow(index)} />

        <div className="w-full flex flex-col lg:flex-row gap-[3rem] mt-[3rem]">
          {/* Left column */}
          <div className="min-w-0 grow flex flex-col">
            <div className="flex items-center gap-[0.8rem] flex-wrap">
              {realEstate.featured && (
                <span className="text-[1.2rem] font-bold px-[1rem] py-[0.4rem] rounded-full bg-amber-400 text-black">★ Destaque</span>
              )}
              <span className="text-[1.2rem] font-bold px-[1rem] py-[0.4rem] rounded-full bg-primary/10 text-primary">
                {TYPE_LABELS[realEstate.type] ?? "Imóvel"} · {SALE_LABELS[realEstate.sale] ?? "Venda"}
              </span>
            </div>

            <h1 className="text-[3.2rem] font-extrabold mt-[1rem] leading-tight">
              {listingTitle}
            </h1>

            <div className="flex items-center text-muted-foreground text-[1.5rem] mt-[1rem]">
              <FaLocationDot size={14} className="mr-[0.6rem] shrink-0" />
              <span>
                {fullAddress || "Endereço não informado"}
                {cityLine ? ` · ${cityLine}` : ""}
                {address?.cep ? ` · CEP ${address.cep}` : ""}
              </span>
            </div>

            {stats.length > 0 && (
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-[1.2rem] mt-[2.4rem]">
                {stats.map(({ key, Icon, value, label }) => (
                  <div
                    key={key}
                    className="flex flex-col items-center justify-center gap-[0.4rem] py-[2rem] rounded-[1rem] bg-muted/40 border border-border"
                  >
                    <Icon size={22} className="text-muted-foreground" />
                    <span className="text-[2.2rem] font-bold leading-none">{value}</span>
                    <span className="text-[1.3rem] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {realEstate.description && (
              <div className="w-full flex flex-col mt-[4rem]">
                <div className="flex items-center">
                  <MdDescription size={22} className="mr-[0.8rem]" />
                  <h2 className="font-bold text-[2.4rem]">Descrição</h2>
                </div>
                <p className="mt-[1.2rem] text-justify text-[1.6rem] leading-[1.7] text-muted-foreground whitespace-pre-line">
                  {realEstate.description}
                </p>
              </div>
            )}

            {features.length > 0 && (
              <div className="w-full flex flex-col mt-[4rem]">
                <h2 className="font-bold text-[2.4rem]">Características</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-[1.2rem] mt-[1.6rem]">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center gap-[1rem]">
                      <span className="h-[2.8rem] w-[2.8rem] rounded-[0.6rem] bg-primary/10 flex justify-center items-center shrink-0">
                        <MdCheck size={16} className="text-primary" />
                      </span>
                      <span className="text-[1.6rem]">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {address?.position && (
              <div className="w-full flex flex-col mt-[4rem]">
                <h2 className="font-bold text-[2.4rem]">Localização</h2>
                <div className="w-full relative mt-[1.6rem]">
                  <MapView
                    latitude={address.position.lat}
                    longitude={address.position.lng}
                    zoom={16}
                    theme={isDark ? "dark" : "light"}
                    className="h-[60rem]"
                  >
                    <MapPin latitude={address.position.lat} longitude={address.position.lng} />
                  </MapView>

                  <div className="absolute bottom-[1.6rem] left-[1.6rem] bg-background border border-border rounded-[0.8rem] px-[1.4rem] py-[0.8rem] shadow-sm text-[1.4rem] font-semibold pointer-events-none z-10">
                    {[address?.district, address?.city].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="w-full lg:w-[38rem] shrink-0">
            <div className="lg:sticky lg:top-[1.5rem]">
              <ContactCard realEstate={realEstate} />
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="w-full flex flex-col border-t border-border mt-[5rem] pt-[3rem]">
            <h2 className="font-bold text-[2.4rem]">Imóveis similares</h2>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-[1.2rem] mt-[1.4rem]">
              {similar.map((item) => (
                <RealEstateCard key={item._id} realEstate={item} variant="mini" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
