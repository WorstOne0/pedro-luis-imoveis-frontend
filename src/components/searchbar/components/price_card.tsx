"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell } from "recharts";
import { CardTitle, Slider, ChartContainer } from "@/components";
import { ChartConfig } from "@/components/ui/chart";
import { useRealEstateStore } from "@/store";

const BUCKETS = 40;

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, minimumFractionDigits: 0 });

export default function PriceCard({ price, onPriceChange }: { price: { min: number; max: number }; onPriceChange: (value: number[]) => void }) {
  const { realEstateList } = useRealEstateStore((state) => state);

  // Distribution of the actual listing prices, so the bars under the slider
  // describe the catalogue rather than a fixed sample dataset.
  const { chartData, floor, ceiling } = useMemo(() => {
    const prices = realEstateList.map((item) => item.price).filter((value) => Number.isFinite(value));

    if (prices.length === 0) return { chartData: [], floor: 0, ceiling: 0 };

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    // Everything priced the same would give a zero-width range and divide by 0.
    if (min === max) return { chartData: [{ price: min, count: prices.length }], floor: min, ceiling: max };

    const width = (max - min) / BUCKETS;
    const buckets = Array.from({ length: BUCKETS }, (_, index) => ({ price: min + index * width, count: 0 }));

    for (const value of prices) {
      const index = Math.min(Math.floor((value - min) / width), BUCKETS - 1);
      buckets[index].count += 1;
    }

    return { chartData: buckets, floor: Math.floor(min), ceiling: Math.ceil(max) };
  }, [realEstateList]);

  const chartConfig = { count: { label: "Imóveis", color: "#2563eb" } } satisfies ChartConfig;

  // A max of 0 means "no upper bound chosen yet", so show the full range.
  const selectedMin = price.min || floor;
  const selectedMax = price.max || ceiling;

  return (
    <div className="h-full w-full flex flex-col justify-between items-center px-[1rem]">
      <CardTitle className="font-bold text-[2.2rem]">Preço</CardTitle>
      <div className="w-full flex justify-center items-center">
        <span>{formatBRL(selectedMin)}</span>
        <span className="mx-[0.5rem]"> - </span>
        <span>{formatBRL(selectedMax)}</span>
      </div>

      {chartData.length > 0 ? (
        <>
          <ChartContainer config={chartConfig} className="min-h-0 grow w-full">
            <BarChart accessibilityLayer data={chartData}>
              <Bar dataKey="count" fill="var(--color-count)" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.price >= selectedMin && entry.price <= selectedMax ? "#2563eb" : "#9ca3af"} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <div className="w-full py-[1rem]">
            <Slider
              min={floor}
              max={ceiling}
              step={Math.max(Math.round((ceiling - floor) / 100), 1)}
              value={[selectedMin, selectedMax]}
              onValueChange={onPriceChange}
            />
          </div>
        </>
      ) : (
        <span className="min-h-0 grow flex items-center italic text-gray-500">Sem imóveis para exibir</span>
      )}
    </div>
  );
}
