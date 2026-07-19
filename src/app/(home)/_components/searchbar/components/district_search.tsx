"use client";

import { useMemo, useState } from "react";
import { IoSearch, IoClose } from "react-icons/io5";
import { MdCheck } from "react-icons/md";
import { isDistrictSelected } from "../store";

/**
 * Multiselect over the districts that actually appear in the catalogue, so a
 * district with zero results is never offered.
 *
 * Selection is shared with the map: both write to filter.district, so ticking a
 * district here highlights its polygon and vice versa.
 */
export default function DistrictSearch({
  districts,
  selected,
  onToggle,
  onClear,
}: {
  districts: string[];
  selected: string[];
  onToggle: (district: string) => void;
  onClear: () => void;
}) {
  const [term, setTerm] = useState("");

  // The whole list is always rendered — it scrolls, so truncating it only hid
  // options behind a message telling you to search for them.
  const matches = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return districts;

    return districts.filter((district) => district.toLowerCase().includes(needle));
  }, [districts, term]);

  return (
    <div className="w-full flex flex-col gap-[0.8rem]">
      <div className="w-full relative">
        <div className="h-full w-[3.6rem] absolute top-0 left-0 flex justify-center items-center text-gray-400 pointer-events-none">
          <IoSearch size={16} />
        </div>

        <input
          type="text"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar bairro..."
          className="h-[4.4rem] w-full pl-[3.6rem] pr-[1rem] text-[1.5rem] rounded-[0.8rem] bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Chips for what is already picked, so the selection stays visible even
          once the list below is scrolled or filtered away.
          Capped at roughly two rows and scrolled past that: unbounded, the block
          grew with every pick and pushed the district list off the panel. */}
      {selected.length > 0 && (
        <div className="w-full flex flex-col gap-[0.6rem]">
          {/* Outside the scroller so it cannot scroll out of reach. */}
          <div className="w-full flex justify-end">
            <button type="button" onClick={onClear} className="text-[1.3rem] text-gray-500 hover:text-red-500 cursor-pointer">
              Limpar seleção
            </button>
          </div>

          <div className="w-full max-h-[8rem] flex flex-wrap items-start gap-[0.6rem] overflow-y-auto">
            {selected.map((district) => (
              <button
                key={district}
                type="button"
                onClick={() => onToggle(district)}
                className="flex items-center gap-[0.6rem] px-[1.2rem] py-[0.6rem] rounded-full bg-primary/10 text-primary text-[1.4rem] font-bold cursor-pointer hover:bg-primary/20"
              >
                {district}
                <IoClose size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full max-h-[22rem] flex flex-col gap-[0.2rem] overflow-y-auto">
        {matches.map((district) => {
          const isChecked = isDistrictSelected(selected, district);

          return (
            <button
              key={district}
              type="button"
              onClick={() => onToggle(district)}
              className="w-full flex items-center gap-[1rem] text-left text-[1.4rem] rounded-[0.8rem] px-[1rem] py-[0.8rem] hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              <span
                className={`h-[1.8rem] w-[1.8rem] shrink-0 flex justify-center items-center rounded-[0.4rem] border
                  ${isChecked ? "bg-primary border-primary" : "border-gray-300 dark:border-gray-600"}`}
              >
                {isChecked && <MdCheck size={13} className="text-white" />}
              </span>

              <span className="min-w-0 truncate">{district}</span>
            </button>
          );
        })}

        {matches.length === 0 && <span className="text-[1.4rem] italic text-gray-500 px-[1rem] py-[0.8rem]">Nenhum bairro encontrado.</span>}
      </div>
    </div>
  );
}
