"use client";

// Next
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Store
import { RealEstate } from "@/store/real_estate";
import { useSearchBarStore, useSavedStore } from "@/store";
import { isDefaultFilter, normalizeDistrict, toDistrictLabel } from "./store";
import districtsGeo from "@/utils/districts_geo";
// Components
import { Card } from "@/components";
import PriceCard from "./components/price_card";
import PropertyTypeCard from "./components/property_type_card";
import PillGroup from "./components/pill_group";
import DistrictSearch from "./components/district_search";
// Icons
import { FaFilter } from "react-icons/fa";
import { MdOutlineSort, MdOutlineClose, MdDeleteOutline, MdArrowForward, MdFavorite, MdFavoriteBorder } from "react-icons/md";

const PROPERTY_LABELS = [
  { type: "apartment", title: "Apto" },
  { type: "house", title: "Casa" },
  { type: "sobrado", title: "Sobrado" },
  { type: "shop", title: "Comercial" },
  { type: "land", title: "Terreno" },
];

const ROOM_OPTIONS = [
  { value: 0, label: "Todos" },
  { value: 1, label: "1" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
];

const BATHROOM_OPTIONS = [
  { value: 0, label: "Todos" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
];

export default function Searchbar({
  realEstateList,
  catalogue,
  children,
}: {
  realEstateList: RealEstate[];
  // Unfiltered, for the price histogram's fixed bounds.
  catalogue: RealEstate[];
  children?: React.ReactNode;
}) {
  const isSearchOpen = useSearchBarStore((state) => state.isSearchOpen);
  const setIsSearchOpen = useSearchBarStore((state) => state.setIsSearchOpen);
  const filter = useSearchBarStore((state) => state.filter);
  const setFilter = useSearchBarStore((state) => state.setFilter);
  const togglePropertyType = useSearchBarStore((state) => state.togglePropertyType);
  const toggleDistrict = useSearchBarStore((state) => state.toggleDistrict);
  const resetFilter = useSearchBarStore((state) => state.resetFilter);
  const savedIds = useSavedStore((state) => state.savedIds);

  // Every district in the city, not just the ones with listings, so this list
  // offers exactly what the map does — otherwise a district picked on the map
  // would have no row here to untick.
  //
  // From the whole catalogue rather than the filtered results: taking them from
  // the results meant selecting one district removed every other option, so a
  // selection could never be widened without clearing it first.
  const districts = useMemo(() => {
    const byKey = new Map<string, string>();

    // Map names first, then let the catalogue overwrite them: the listings'
    // spelling is the one the API matches on.
    districtsGeo.districts.forEach((district: { name: string }) => byKey.set(normalizeDistrict(district.name), toDistrictLabel(district.name)));
    catalogue.forEach((item) => {
      const district = item.address?.district;
      if (district) byKey.set(normalizeDistrict(district), district);
    });

    return [...byKey.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [catalogue]);

  const isClean = isDefaultFilter(filter);

  const buildSection = ({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) => (
    <div className="w-full flex flex-col gap-[1rem]">
      <div className="w-full flex justify-between items-baseline">
        <span className="font-bold text-[1.6rem]">{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );

  const formatArea = () => {
    const { min, max } = filter.area;
    if (!min && !max) return "Qualquer";
    if (min && !max) return `${min}+ m²`;
    if (!min && max) return `até ${max} m²`;

    return `${min} – ${max} m²`;
  };

  return (
    <AnimatePresence>
      {!isSearchOpen && (
        <motion.div
          key={"searchbar"}
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ ease: "easeIn", duration: 0.2 }}
          className="px-3 mt-[1.5rem] mb-[0.5rem]"
        >
          <div className="h-full w-full flex flex-col rounded-[0.8rem]">
            <div className="flex justify-between items-end px-[0.5rem]">
              <div>
                <span className="text-[3rem] font-bold leading-[3rem]">{realEstateList.length}</span>
                <span className="italic ml-1">Imóveis</span>
              </div>
              <div className="flex">
                <Card className="py-2 px-[1.2rem] flex items-center mr-3">
                  <MdOutlineSort size={20} />
                </Card>
                <Card className="py-2 px-[1.8rem] flex items-center cursor-pointer relative" onClick={() => setIsSearchOpen(true)}>
                  <FaFilter size={13} />
                  <span className="ml-3 font-bold text-[1.6rem]">Filtros</span>
                  {/* A dot is enough to signal active filters without a count
                      that would need explaining. */}
                  {!isClean && <span className="h-[1rem] w-[1rem] rounded-full bg-primary absolute top-[-0.3rem] right-[-0.3rem]" />}
                </Card>
              </div>
            </div>
          </div>

          {children}
        </motion.div>
      )}

      {isSearchOpen && (
        <motion.div
          key={"filters"}
          // Top to bottom: the panel drops over the list rather than sliding in
          // sideways from off-screen.
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ ease: "easeIn", duration: 0.2 }}
          // z-20, not z-10: the list renders after this panel, so at equal
          // z-index a selected card's check badge painted through it.
          className="h-full w-full bg-background flex flex-col rounded-[0.8rem] absolute top-0 left-0 z-20"
        >
          {/* Header */}
          <div className="w-full flex justify-between items-center px-[1.8rem] py-[1.6rem] border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-[1rem]">
              <FaFilter size={16} className="text-primary" />
              <span className="font-bold text-[2rem]">Filtros</span>
            </div>

            <div className="flex items-center gap-[0.8rem]">
              <button
                type="button"
                onClick={resetFilter}
                disabled={isClean}
                className="flex items-center gap-[0.5rem] text-[1.4rem] text-gray-500 hover:text-red-500 disabled:opacity-40 disabled:hover:text-gray-500 disabled:cursor-not-allowed cursor-pointer"
              >
                <MdDeleteOutline size={18} />
                Limpar
              </button>

              <button
                type="button"
                aria-label="Fechar filtros"
                onClick={() => setIsSearchOpen(false)}
                className="h-[3.4rem] w-[3.4rem] flex justify-center items-center rounded-[0.8rem] hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              >
                <MdOutlineClose size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="min-h-0 grow w-full flex flex-col gap-[2.4rem] px-[1.8rem] py-[2rem] overflow-y-auto">
            <button
              type="button"
              aria-pressed={filter.savedOnly}
              onClick={() => setFilter({ savedOnly: !filter.savedOnly })}
              className={`w-full flex items-center gap-[1.2rem] rounded-[1rem] border px-[1.6rem] py-[1.4rem] cursor-pointer transition-colors
                ${filter.savedOnly ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60"}`}
            >
              {filter.savedOnly ? <MdFavorite size={20} className="text-red-500" /> : <MdFavoriteBorder size={20} className="text-red-500" />}

              <span className="min-w-0 grow flex flex-col text-left">
                <span className="text-[1.6rem] font-bold">Salvos</span>
                <span className="text-[1.3rem] text-gray-500">
                  {savedIds.length === 0 ? "Nenhum imóvel salvo ainda" : `${savedIds.length} ${savedIds.length === 1 ? "imóvel salvo" : "imóveis salvos"}`}
                </span>
              </span>

              {filter.savedOnly && <span className="text-[1.3rem] font-bold text-primary shrink-0">Ativo</span>}
            </button>

            {buildSection({
              title: "Tipo de imóvel",
              children: (
                <div className="w-full grid grid-cols-3 gap-[1rem]">
                  {PROPERTY_LABELS.map(({ type, title }) => (
                    <PropertyTypeCard
                      key={type}
                      type={type}
                      title={title}
                      isSelected={filter.propertyType.includes(type)}
                      onToggle={() => togglePropertyType(type)}
                    />
                  ))}
                </div>
              ),
            })}

            {buildSection({
              title: "Bairro",
              aside:
                filter.district.length > 0 ? <span className="text-[1.4rem] text-gray-500">{filter.district.length} selecionado(s)</span> : undefined,
              children: (
                <DistrictSearch districts={districts} selected={filter.district} onToggle={toggleDistrict} onClear={() => setFilter({ district: [] })} />
              ),
            })}

            <PriceCard
              catalogue={catalogue}
              price={filter.price}
              onPriceChange={(value) => setFilter({ price: { min: value[0], max: value[1] } })}
            />

            {buildSection({
              title: "Quartos",
              children: <PillGroup options={ROOM_OPTIONS} value={filter.rooms} onChange={(rooms) => setFilter({ rooms })} />,
            })}

            {buildSection({
              title: "Banheiros",
              children: <PillGroup options={BATHROOM_OPTIONS} value={filter.bathrooms} onChange={(bathrooms) => setFilter({ bathrooms })} />,
            })}

            {buildSection({
              title: "Área (m²)",
              aside: <span className="text-[1.4rem] text-gray-500">{formatArea()}</span>,
              children: (
                <div className="w-full flex items-center gap-[1rem]">
                  {(["min", "max"] as const).map((edge) => (
                    <div key={edge} className="min-w-0 grow relative">
                      <input
                        type="number"
                        min={0}
                        value={filter.area[edge] || ""}
                        onChange={(event) => {
                          const next = event.target.valueAsNumber;
                          setFilter({ area: { ...filter.area, [edge]: Number.isNaN(next) ? 0 : Math.max(next, 0) } });
                        }}
                        placeholder={edge === "min" ? "100" : "400"}
                        className="h-[4.4rem] w-full pl-[1.2rem] pr-[4rem] text-[1.5rem] rounded-[0.8rem] bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-[1.2rem] top-1/2 -translate-y-1/2 text-[1.3rem] text-gray-400 pointer-events-none">
                        {edge === "min" ? "mín" : "máx"}
                      </span>
                    </div>
                  ))}
                </div>
              ),
            })}
          </div>

          {/* Footer */}
          <div className="w-full px-[1.8rem] py-[1.6rem] border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="h-[5.4rem] w-full flex justify-center items-center gap-[1rem] rounded-[1rem] bg-primary text-white font-bold text-[1.8rem] cursor-pointer hover:opacity-90"
            >
              Ver {realEstateList.length} {realEstateList.length === 1 ? "imóvel" : "imóveis"}
              <MdArrowForward size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
