/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
// Store
import { RealEstate } from "@/store/real_estate";
import { useRealEstateStore } from "@/store";
// Components
import { Card } from "@/components/ui/card";
import { SaveButton } from "@/components";
// Icons
import { MdOutlineBed, MdOutlineShower, MdVerified } from "react-icons/md";
import { FaLocationDot } from "react-icons/fa6";
import { PiGarage } from "react-icons/pi";
import { BiArea, BiExpand } from "react-icons/bi";

// Must match the enum in the backend real_estate model.
const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  land: "Terreno",
  shop: "Comercial",
  sobrado: "Sobrado",
};

// `mini` has less horizontal room, so it uses short labels.
const TYPE_LABELS_SHORT: Record<string, string> = {
  apartment: "Apto",
  house: "Casa",
  land: "Terreno",
  shop: "Comercial",
  sobrado: "Sobrado",
};

const SALE_LABELS: Record<string, string> = {
  sell: "Venda",
  rent: "Aluguel",
  both: "Venda/Aluguel",
};

/**
 * - `default`  the original card: image on top, price, stats row, full address
 * - `preview`  badge over the image, price, title, location and a divided stats
 *              footer. Used by the home list, and shared with the dashboard
 *              where it also backs the live preview in the listing form.
 * - `mini`     image + price + name only, for secondary rails like "similares"
 */
export type CardVariant = "default" | "preview" | "mini";

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, minimumFractionDigits: 0 });

/**
 * Most imported listings have no development name, so fall back to a generated
 * title rather than rendering an empty heading.
 */
const resolveTitle = (realEstate: RealEstate) => {
  if (realEstate.title?.trim()) return realEstate.title;

  const type = TYPE_LABELS_SHORT[realEstate.type] ?? "Imóvel";
  const deal = realEstate.sale === "rent" ? "para alugar" : "à venda";
  const district = realEstate.address?.district;

  return district ? `${type} ${deal} no ${district}` : `${type} ${deal}`;
};

export default function RealEstateCard({
  realEstate,
  onClickCallback,
  variant = "preview",
}: {
  realEstate: RealEstate;
  onClickCallback?: () => void;
  variant?: CardVariant;
}) {
  const realEstateSelected = useRealEstateStore((state) => state.realEstateSelected);
  const setRealEstateSelected = useRealEstateStore((state) => state.setRealEstateSelected);
  const router = useRouter();

  const isSelected = realEstateSelected?._id === realEstate._id;
  const address = realEstate.address;

  // First click selects (and centres the map), second opens the listing.
  const handleCardClick = () => {
    if (onClickCallback) onClickCallback();

    if (isSelected) return router.push(`/real_estate/${realEstate._id}`);

    setRealEstateSelected(realEstate);
  };

  const selectedCorner = isSelected && (
    <div
      className="absolute top-0 left-0 h-[4rem] w-[4rem] bg-primary z-10"
      style={{ clipPath: "polygon(0 0,100% 0,0 100%)", borderTopLeftRadius: "0.8rem" }}
    >
      <MdVerified size={18} color="white" className="ml-1 mt-1" />
    </div>
  );

  // ---- mini: a supporting rail, never the focus of a page ----------------
  if (variant === "mini") {
    return (
      <Card
        className="w-full flex flex-col select-none cursor-pointer rounded-[1rem] overflow-hidden hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <div className="w-full h-[13rem] relative">
          <img className="h-full w-full object-cover object-center" src={realEstate.thumbnail} alt={resolveTitle(realEstate)} />
        </div>

        <div className="flex flex-col gap-[0.2rem] px-[1.2rem] py-[1rem]">
          <span className="text-[1.7rem] font-extrabold leading-none">{formatBRL(realEstate.price)}</span>
          <span className="text-[1.3rem] text-[#6c757d] truncate">
            {realEstate.title?.trim() || TYPE_LABELS_SHORT[realEstate.type] || "Imóvel"}
            {address?.district ? ` · ${address.district}` : ""}
          </span>
        </div>
      </Card>
    );
  }

  // ---- preview: shared with the dashboard, same markup there --------------
  if (variant === "preview") {
    const location = [address?.district, address?.city, address?.state].filter(Boolean).join(" · ");

    const stats = [
      { key: "rooms", Icon: MdOutlineBed, value: realEstate.rooms },
      { key: "bathrooms", Icon: MdOutlineShower, value: realEstate.bathrooms },
      { key: "garages", Icon: PiGarage, value: realEstate.garages },
    ].filter((stat) => Number(stat.value) > 0);

    const badge = [TYPE_LABELS[realEstate.type], SALE_LABELS[realEstate.sale]].filter(Boolean).join(" · ");

    return (
      <Card
        className={`w-full bg-card rounded-[1.6rem] overflow-hidden select-none cursor-pointer relative hover:shadow-md transition-shadow
          ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={handleCardClick}
      >
        {selectedCorner}

        <div className="h-[18rem] w-full bg-muted flex justify-center items-center relative">
          <img
            className={`h-full w-full object-cover object-center ${realEstate.sold ? "grayscale-[0.6] opacity-80" : ""}`}
            src={realEstate.thumbnail}
            alt={resolveTitle(realEstate)}
          />

          {badge && (
            <span className="text-[1.2rem] font-semibold text-white bg-black/70 rounded-[0.6rem] px-[0.8rem] py-[0.4rem] absolute bottom-[1rem] left-[1rem]">
              {badge}
            </span>
          )}

          {/* Status flags top-left, away from the save button. Sold wins over
              destaque — a sold listing is not something to promote. */}
          <div className="flex flex-col items-start gap-[0.5rem] absolute top-[1rem] left-[1rem]">
            {realEstate.sold && (
              <span className="text-[1.2rem] font-bold text-white bg-red-600 rounded-[0.6rem] px-[0.8rem] py-[0.4rem]">VENDIDO</span>
            )}
            {realEstate.featured && !realEstate.sold && (
              <span className="text-[1.2rem] font-bold text-black bg-amber-400 rounded-[0.6rem] px-[0.8rem] py-[0.4rem]">★ Destaque</span>
            )}
          </div>

          <div className="absolute top-[1rem] right-[1rem]">
            <SaveButton realEstateId={realEstate._id} overlay />
          </div>
        </div>

        <div className="w-full flex flex-col gap-[0.6rem] p-[1.6rem]">
          <span className="text-[2.4rem] font-bold leading-[2.8rem]">{formatBRL(realEstate.price)}</span>

          <span className="text-[1.6rem] font-semibold leading-[2rem]">{resolveTitle(realEstate)}</span>

          <div className="flex items-center gap-[0.6rem] text-muted-foreground">
            <FaLocationDot size={12} className="shrink-0" />
            <span className="text-[1.3rem] truncate">{location || "Endereço não informado"}</span>
          </div>

          {(stats.length > 0 || realEstate.area > 0) && (
            <div className="w-full flex items-center justify-between gap-[1rem] border-t border-border pt-[1.2rem] mt-[0.6rem]">
              <div className="flex items-center gap-[1.4rem] text-muted-foreground">
                {stats.map(({ key, Icon, value }) => (
                  <div key={key} className="flex items-center gap-[0.5rem]">
                    <Icon size={16} />
                    <span className="text-[1.4rem]">{value}</span>
                  </div>
                ))}
              </div>

              {realEstate.area > 0 && (
                <div className="flex items-center gap-[0.5rem] text-muted-foreground shrink-0">
                  <BiExpand size={16} />
                  <span className="text-[1.4rem]">{realEstate.area} m²</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // ---- default: the original layout, on the dashboard's card styling ------
  // Same markup as the dashboard's RealEstateCard so the two stay identical.
  const stats = [
    { key: "rooms", Icon: MdOutlineBed, value: realEstate.rooms, label: "quartos" },
    { key: "bathrooms", Icon: MdOutlineShower, value: realEstate.bathrooms, label: "banheiros" },
    { key: "garages", Icon: PiGarage, value: realEstate.garages, label: "vagas" },
    { key: "area", Icon: BiArea, value: realEstate.area, label: "m²" },
  ].filter((stat) => Number(stat.value) > 0);

  return (
    <Card
      className="w-full flex flex-col select-none cursor-pointer bg-card rounded-[1rem] overflow-hidden mt-4 relative hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {selectedCorner}

      <div className="h-[22rem] w-full">
        <img className="h-full w-full object-cover object-center" src={realEstate.thumbnail} alt={resolveTitle(realEstate)} />
      </div>

      <div className="grow flex flex-col gap-[0.6rem] px-[1.5rem] pt-[1.2rem] pb-[1.4rem]">
        <div className="flex justify-between items-center gap-[1rem]">
          <span className="text-[2.6rem] font-extrabold leading-none">{formatBRL(realEstate.price)}</span>
          <span className="text-[1.4rem] text-muted-foreground shrink-0">{TYPE_LABELS[realEstate.type]}</span>
        </div>

        <div className="flex items-center flex-wrap gap-x-[1.8rem] gap-y-[0.4rem] text-muted-foreground">
          {stats.map(({ key, Icon, value, label }) => (
            <div key={key} className="flex items-center gap-[0.5rem]">
              <Icon size={16} className="shrink-0" />
              <span className="font-bold text-[1.5rem]">
                {value} {label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-[0.6rem] select-text text-muted-foreground">
          <FaLocationDot size={12} className="shrink-0 mt-[0.4rem]" />
          <span className="text-[1.4rem] leading-[2rem]">
            {[address?.street, address?.number, address?.district, address?.city, address?.state].filter(Boolean).join(", ") || "Endereço não informado"}
          </span>
        </div>
      </div>
    </Card>
  );
}
