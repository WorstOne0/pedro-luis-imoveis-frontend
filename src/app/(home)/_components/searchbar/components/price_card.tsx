"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell } from "recharts";
import { Slider, ChartContainer } from "@/components";
import { ChartConfig } from "@/components/ui/chart";
import { RealEstate } from "@/store/real_estate";

const BUCKETS = 32;

const formatCompactBRL = (value: number) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",").replace(",0", "")}M`;
  if (value >= 1_000) return `R$ ${Math.round(value / 1_000)}k`;

  return `R$ ${value}`;
};

export default function PriceCard({
  catalogue,
  price,
  onPriceChange,
}: {
  // The *unfiltered* catalogue. Bounds and the histogram both come from it, so
  // the slider keeps fixed endpoints and out-of-range bars stay on screen while
  // the results list narrows.
  catalogue: RealEstate[];
  price: { min: number; max: number };
  onPriceChange: (value: number[]) => void;
}) {
  const { buckets, floor, ceiling } = useMemo(() => {
    const prices = catalogue.map((item) => item.price).filter((value) => Number.isFinite(value));
    if (prices.length === 0) return { buckets: [], floor: 0, ceiling: 0 };

    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));

    // Everything priced the same would give a zero-width range and divide by 0.
    if (max <= min) return { buckets: [], floor: min, ceiling: max };

    const width = (max - min) / BUCKETS;
    const counts = new Array(BUCKETS).fill(0);

    for (const value of prices) {
      const index = Math.min(Math.floor((value - min) / width), BUCKETS - 1);
      counts[index] += 1;
    }

    return {
      buckets: counts.map((count, index) => ({ price: min + index * width, count })),
      floor: min,
      ceiling: max,
    };
  }, [catalogue]);

  const chartConfig = { count: { label: "Imóveis", color: "#2563eb" } } satisfies ChartConfig;

  // price.max === 0 is the untouched state, meaning the full range is selected.
  const hasSelection = price.max > 0;
  const selectedMin = hasSelection ? price.min : floor;
  const selectedMax = hasSelection ? price.max : ceiling;

  if (buckets.length === 0) {
    return (
      <div className="w-full flex flex-col gap-[1rem]">
        <span className="font-bold text-[1.6rem]">Preço</span>
        <span className="italic text-muted-foreground text-[1.4rem]">Sem imóveis para exibir</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[1rem]">
      <div className="w-full flex justify-between items-baseline">
        <span className="font-bold text-[1.6rem]">Preço</span>
        <span className="text-[1.4rem] text-muted-foreground">
          {formatCompactBRL(selectedMin)} – {formatCompactBRL(selectedMax)}
        </span>
      </div>

      <ChartContainer config={chartConfig} className="h-[8rem] w-full">
        <BarChart accessibilityLayer data={buckets} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          {/* Bar needs its own fill even though every Cell overrides it —
              without one recharts renders empty rectangle groups. */}
          <Bar dataKey="count" fill="var(--color-count)" radius={3} isAnimationActive={false}>
            {buckets.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                // Out-of-range bars stay visible, just muted.
                fill={entry.price >= selectedMin && entry.price <= selectedMax ? "#2563eb" : "#e5e7eb"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <Slider
        min={floor}
        max={ceiling}
        step={Math.max(Math.round((ceiling - floor) / 100), 1)}
        value={[selectedMin, selectedMax]}
        onValueChange={onPriceChange}
      />
    </div>
  );
}
