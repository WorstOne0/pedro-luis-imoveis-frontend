"use client";

export type PillOption = { value: number; label: string };

/**
 * Row of mutually exclusive pills ("Todos · 1 · 2+ · 3+"). Values are minimums,
 * matching how the API treats rooms/bathrooms, and 0 means no filter.
 */
export default function PillGroup({ options, value, onChange }: { options: PillOption[]; value: number; onChange: (value: number) => void }) {
  return (
    <div className="w-full flex gap-[0.8rem]">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`min-w-0 grow h-[4.4rem] rounded-[0.8rem] border text-[1.5rem] font-bold transition-colors cursor-pointer
              ${
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-400"
              }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
