/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
// Store
import { RealEstate } from "@/store/real_estate";
import { useRealEstateStore } from "@/store";
// Components
import { Card } from "@/components/ui/card";
// Icons
import { MdOutlineBed, MdOutlineShower, MdFavoriteBorder, MdVerified } from "react-icons/md";
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

// The redesigned variants have less horizontal room, so they use short labels.
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
 * - `default`  the original card, unchanged
 * - `compact`  horizontal, image beside the text (fits the map sidebar)
 * - `extended` redesigned vertical card with badges and a generated title
 * - `mini`     image + price + name only, for secondary rails like "similares"
 * - `preview`  compact hero card: badge over the image, price, title, location
 *              and a divided stats footer. Shared with the dashboard, where it
 *              also backs the live preview in the listing form.
 */
export type CardVariant = "default" | "compact" | "extended" | "mini" | "preview";

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

const Stats = ({ realEstate, small = false }: { realEstate: RealEstate; small?: boolean }) => {
  const stats = [
    { key: "rooms", Icon: MdOutlineBed, value: realEstate.rooms, suffix: "" },
    { key: "bathrooms", Icon: MdOutlineShower, value: realEstate.bathrooms, suffix: "" },
    { key: "garages", Icon: PiGarage, value: realEstate.garages, suffix: "" },
    { key: "area", Icon: BiArea, value: realEstate.area, suffix: " m²" },
  ].filter((stat) => Number(stat.value) > 0);

  if (stats.length === 0) return null;

  return (
    <div className="flex items-center flex-wrap gap-x-[1.6rem] gap-y-[0.4rem]">
      {stats.map(({ key, Icon, value, suffix }) => (
        <div key={key} className="flex items-center text-[#6c757d]">
          <Icon size={small ? 14 : 16} className="mr-[0.5rem] shrink-0" />
          <span className={`font-bold ${small ? "text-[1.3rem]" : "text-[1.5rem]"}`}>
            {value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
};

const Badge = ({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "accent" | "featured" }) => {
  const tones = {
    muted: "bg-black/70 text-white",
    accent: "bg-primary/10 text-primary",
    featured: "bg-amber-400 text-black",
  };

  return <span className={`text-[1.2rem] font-bold px-[0.9rem] py-[0.35rem] rounded-full whitespace-nowrap ${tones[tone]}`}>{children}</span>;
};

export default function RealEstateCard({
  realEstate,
  onClickCallback,
  variant = "extended",
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

  // ---- default: the original layout, on the dashboard's card styling ------
  // Same markup as the dashboard's RealEstateCard so the two stay identical.
  // Colours are theme tokens rather than the old hardcoded white/#6c757d,
  // which stayed light even in dark mode.
  if (variant === "default") {
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

  // ---- preview: shared with the dashboard, same markup there --------------
  if (variant === "preview") {
    const previewLocation = [address?.district, address?.city, address?.state].filter(Boolean).join(" · ");

    const previewStats = [
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
          <img className="h-full w-full object-cover object-center" src={realEstate.thumbnail} alt={resolveTitle(realEstate)} />

          {badge && (
            <span className="text-[1.2rem] font-semibold text-white bg-black/70 rounded-[0.6rem] px-[0.8rem] py-[0.4rem] absolute bottom-[1rem] left-[1rem]">
              {badge}
            </span>
          )}
        </div>

        <div className="w-full flex flex-col gap-[0.6rem] p-[1.6rem]">
          <span className="text-[2.4rem] font-bold leading-[2.8rem]">{formatBRL(realEstate.price)}</span>

          <span className="text-[1.6rem] font-semibold leading-[2rem]">{resolveTitle(realEstate)}</span>

          <div className="flex items-center gap-[0.6rem] text-muted-foreground">
            <FaLocationDot size={12} className="shrink-0" />
            <span className="text-[1.3rem] truncate">{previewLocation || "Endereço não informado"}</span>
          </div>

          {(previewStats.length > 0 || realEstate.area > 0) && (
            <div className="w-full flex items-center justify-between gap-[1rem] border-t border-border pt-[1.2rem] mt-[0.6rem]">
              <div className="flex items-center gap-[1.4rem] text-muted-foreground">
                {previewStats.map(({ key, Icon, value }) => (
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

  // ---- shared by the redesigned variants ---------------------------------
  const location = [address?.district, address?.city].filter(Boolean).join(" · ");
  const typeLabel = `${TYPE_LABELS_SHORT[realEstate.type] ?? "Imóvel"} · ${SALE_LABELS[realEstate.sale] ?? "Venda"}`;

  const favourite = (
    <button
      type="button"
      aria-label="Favoritar"
      onClick={(event) => event.stopPropagation()}
      className="h-[3.4rem] w-[3.4rem] rounded-full bg-white/90 flex justify-center items-center shadow cursor-pointer hover:bg-white"
    >
      <MdFavoriteBorder size={18} className="text-red-500" />
    </button>
  );

  // ---- compact: image beside the text, sized for the map sidebar ----------
  if (variant === "compact") {
    return (
      <Card
        className={`w-full flex select-none cursor-pointer rounded-[0.8rem] overflow-hidden mt-4 relative ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={handleCardClick}
      >
        {selectedCorner}

        <div className="min-w-[13rem] w-[13rem] relative shrink-0">
          <img className="h-full w-full object-cover object-center" src={realEstate.thumbnail} alt={resolveTitle(realEstate)} />
          {realEstate.featured && (
            <div className="absolute bottom-[0.6rem] left-[0.6rem]">
              <Badge tone="featured">★ Destaque</Badge>
            </div>
          )}
        </div>

        <div className="min-w-0 grow flex flex-col gap-[0.4rem] p-[1.2rem]">
          <div className="flex justify-between items-start gap-[1rem]">
            <Badge tone="accent">{typeLabel}</Badge>
            {favourite}
          </div>

          <span className="font-bold text-[1.7rem] truncate">{resolveTitle(realEstate)}</span>

          <div className="flex items-center text-[#6c757d] text-[1.3rem]">
            <FaLocationDot size={11} className="mr-[0.5rem] shrink-0" />
            <span className="truncate">{location || "Endereço não informado"}</span>
          </div>

          <span className="text-[2.2rem] font-extrabold text-primary">{formatBRL(realEstate.price)}</span>

          <Stats realEstate={realEstate} small />
        </div>
      </Card>
    );
  }

  // ---- extended: redesigned vertical card --------------------------------
  return (
    <Card
      className={`w-full flex flex-col select-none cursor-pointer rounded-[0.8rem] overflow-hidden mt-4 relative ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={handleCardClick}
    >
      {selectedCorner}

      <div className="w-full h-[24rem] relative">
        <img className="h-full w-full object-cover object-center" src={realEstate.thumbnail} alt={resolveTitle(realEstate)} />

        {realEstate.featured && (
          <div className="absolute top-[1rem] left-[1rem]">
            <Badge tone="featured">★ Destaque</Badge>
          </div>
        )}

        <div className="absolute top-[1rem] right-[1rem]">{favourite}</div>

        <div className="absolute bottom-[1rem] left-[1rem]">
          <Badge>{typeLabel}</Badge>
        </div>
      </div>

      <div className="grow flex flex-col gap-[0.6rem] px-[1.5rem] py-[1.2rem]">
        <span className="text-[2.6rem] font-extrabold text-primary leading-none">{formatBRL(realEstate.price)}</span>

        <span className="font-bold text-[1.8rem]">{resolveTitle(realEstate)}</span>

        <div className="flex items-center text-[#6c757d] text-[1.4rem]">
          <FaLocationDot size={12} className="mr-[0.5rem] shrink-0" />
          <span className="truncate">
            {location || "Endereço não informado"}
            {address?.state ? ` · ${address.state}` : ""}
          </span>
        </div>

        {realEstate.description && <p className="text-[1.4rem] text-[#6c757d] line-clamp-2 mt-[0.2rem]">{realEstate.description}</p>}

        <div className="border-t border-gray-200 dark:border-gray-700 mt-[0.6rem] pt-[0.9rem]">
          <Stats realEstate={realEstate} />
        </div>
      </div>
    </Card>
  );
}
