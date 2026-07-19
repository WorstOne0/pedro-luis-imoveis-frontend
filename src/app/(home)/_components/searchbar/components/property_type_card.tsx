"use client";

import { ApartamentSVG, HouseSVG, LandSVG, ShopSVG, SobradoSVG } from "@/components";

// Keys match the type enum in the backend real_estate model.
const SVGS: Record<string, React.ComponentType<{ className?: string }>> = {
  apartment: ApartamentSVG,
  house: HouseSVG,
  land: LandSVG,
  shop: ShopSVG,
  sobrado: SobradoSVG,
};

export default function PropertyTypeCard({
  type,
  title,
  isSelected,
  onToggle,
}: {
  type: string;
  title: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const Svg = SVGS[type];
  if (!Svg) return null;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onToggle}
      className={`h-[8.6rem] w-full flex flex-col justify-center items-center gap-[0.6rem] rounded-[1rem] border transition-colors select-none cursor-pointer
        ${
          isSelected
            ? "border-primary bg-primary/10"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
    >
      <Svg className={`w-[2.8rem] h-[2.8rem] ${isSelected ? "fill-primary" : "fill-gray-500 dark:fill-gray-300"}`} />
      <span className={`font-bold text-[1.4rem] ${isSelected ? "text-primary" : "text-gray-600 dark:text-gray-300"}`}>{title}</span>
    </button>
  );
}
