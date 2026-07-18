"use client";

// Next
import { motion, AnimatePresence } from "framer-motion";
// Store
import { useDistrictStore, useRealEstateStore, useSearchBarStore } from "@/store";
// Components
import { ApartamentSVG, Card, CardTitle, HouseSVG, LandSVG, ShopSVG, SobradoSVG } from "@/components";
import PriceCard from "./components/price_card";
// Icons
import { FaFilter, FaPlus, FaMinus } from "react-icons/fa";
import { MdOutlineSort, MdOutlineClose, MdDelete } from "react-icons/md";

const PROPERTY_LABELS: { type: string; title: string }[] = [
  { type: "apartment", title: "Apartamento" },
  { type: "house", title: "Casa" },
  { type: "land", title: "Terreno" },
  { type: "shop", title: "Comercial" },
  { type: "sobrado", title: "Sobrado" },
];

const SVGS: Record<string, React.ComponentType<{ className?: string }>> = {
  apartment: ApartamentSVG,
  house: HouseSVG,
  land: LandSVG,
  shop: ShopSVG,
  sobrado: SobradoSVG,
};

export default function Searchbar({ children }: { children?: React.ReactNode }) {
  const { isSearchOpen, setIsSearchOpen, filter, setFilter, togglePropertyType, resetFilter } = useSearchBarStore((state) => state);
  const { districtSelected } = useDistrictStore((state) => state);
  const { realEstateList, totalDocs } = useRealEstateStore((state) => state);

  const onPriceChange = (value: number[]) => setFilter({ price: { min: value[0], max: value[1] } });

  const buildPropertyCard = (type: string, title: string) => {
    const isSelected = filter.propertyType.includes(type);
    const Svg = SVGS[type];

    return (
      <Card
        key={type}
        className={`flex flex-col justify-center items-center select-none cursor-pointer
          ${isSelected ? "border-2 border-primary dark:bg-primary" : "dark:bg-secondary"}`}
        onClick={() => togglePropertyType(type)}
      >
        <Svg className={`w-[3.8rem] h-[3.8rem] ${isSelected ? "fill-primary" : "fill-black"} dark:fill-white`} />
        <span className={`font-bold text-[1.4rem] ${isSelected ? "text-primary dark:text-white" : ""}`}>{title}</span>
      </Card>
    );
  };

  const buildCounterCard = (key: "rooms" | "bathrooms" | "garages" | "area", title: string, step = 1) => {
    const value = filter[key];
    const change = (isAdd: boolean) => setFilter({ [key]: isAdd ? value + step : Math.max(value - step, 0) });

    return (
      <Card className={`h-full w-full flex flex-col justify-center items-center select-none mr-[1rem] last:mr-0 dark:bg-secondary`}>
        <div className="w-full flex justify-between items-center px-[3rem]">
          <FaMinus className="text-[1.8rem] cursor-pointer" onClick={() => change(false)} />
          <span className="text-[4.6rem]">{value}</span>
          <FaPlus className="text-[1.8rem] cursor-pointer" onClick={() => change(true)} />
        </div>
        <span className={`font-bold text-[1.4rem] mt-[1rem]`}>{title}</span>
      </Card>
    );
  };

  return (
    <AnimatePresence>
      {!isSearchOpen && (
        <motion.div
          key={"searchbar"}
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{
            ease: "easeIn",
            duration: 0.2,
          }}
          className="px-3 mt-[1.5rem] mb-[0.5rem]"
        >
          <div className="h-full w-full flex flex-col rounded-[0.8rem]">
            <div className="flex justify-between items-end px-[0.5rem]">
              <div>
                <span className="text-[3rem] font-bold leading-[3rem]">{totalDocs ?? realEstateList.length}</span>
                <span className="italic ml-1">Imóveis</span>
              </div>
              <div className="flex">
                <Card className="py-2 px-[1.2rem] flex items-center mr-3">
                  <MdOutlineSort size={20} />
                </Card>
                <Card className="py-2 px-[1.8rem] flex items-center cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                  <FaFilter size={13} />
                  <span className="ml-3 font-bold text-[1.6rem]">Filtros</span>
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
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{
            ease: "easeIn",
            duration: 0.2,
          }}
          className="h-full w-full bg-background flex flex-col items-start rounded-[0.8rem] absolute top-0 left-0 z-10"
        >
          {/* Title */}
          <div className="w-full flex justify-between items-center pl-[2rem] pr-[1.5rem] pt-[1rem]  mt-[0.8rem] mb-[0.5rem]">
            <div className="flex items-center">
              <FaFilter className="mb-1" size={18} />
              <span className="ml-3 font-bold text-[2.2rem]">Filtros</span>
            </div>

            <div className="flex">
              <Card className="py-2 px-[1.2rem] flex items-center mr-3 bg-red-500 cursor-pointer" onClick={resetFilter}>
                <MdDelete size={20} color="white" />
              </Card>
              <Card className="py-2 px-[1.8rem] flex items-center cursor-pointer" onClick={() => setIsSearchOpen(false)}>
                <MdOutlineClose size={20} />
                <span className="ml-3 font-bold text-[1.6rem]">Fechar</span>
              </Card>
            </div>
          </div>

          {/*  */}
          <div className="min-h-0 w-full p-[1rem] grow flex flex-col overflow-y-auto">
            <Card className="min-h-[25rem] w-full my-[0.5rem] flex flex-col justify-between items-center p-[0.8rem]">
              <CardTitle className="font-bold text-[2.2rem] mb-[0.8rem]">Tipo de Imóvel</CardTitle>
              <div className="w-full grow grid grid-cols-3 grid-rows-2 grid-flow-col gap-4">
                {PROPERTY_LABELS.map(({ type, title }) => buildPropertyCard(type, title))}
              </div>
            </Card>

            <Card className="min-h-[10rem] w-full my-3 flex flex-col justify-between items-center p-[0.8rem]">
              <CardTitle className="font-bold text-[2.2rem] mb-[0.8rem]">Bairro</CardTitle>
              <span className="italic">{filter.district || districtSelected?.name || "Todos"}</span>
            </Card>

            <Card className="min-h-[25rem] w-full my-3 flex flex-col justify-between items-center p-[0.8rem]">
              <PriceCard price={filter.price} onPriceChange={onPriceChange} />
            </Card>

            <Card className="min-h-[22rem] w-full my-3 flex flex-col justify-between items-center p-[0.8rem]">
              <CardTitle className="font-bold text-[2.2rem] mb-[0.8rem] ">Quartos</CardTitle>
              <div className="w-full grow flex">
                {buildCounterCard("rooms", "Quartos")}
                {buildCounterCard("bathrooms", "Banheiros")}
              </div>
            </Card>

            <Card className="min-h-[25rem] w-full my-3 flex flex-col justify-between items-center p-[0.8rem]">
              <CardTitle className="font-bold text-[2.2rem] mb-[0.8rem]">Espaço</CardTitle>
              <div className="w-full grow flex">
                {buildCounterCard("garages", "Garagens")}
                {buildCounterCard("area", "Area (m2)", 50)}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
