"use client";

import { useSavedStore } from "@/store";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

/**
 * Save / unsave a listing. Backed by localStorage via useSavedStore.
 *
 * `overlay` is the variant that sits on top of a card image; the default is a
 * bordered button for use on a surface.
 */
export default function SaveButton({
  realEstateId,
  overlay = false,
  className = "",
}: {
  realEstateId: string;
  overlay?: boolean;
  className?: string;
}) {
  const savedIds = useSavedStore((state) => state.savedIds);
  const toggleSaved = useSavedStore((state) => state.toggleSaved);
  const isHydrated = useSavedStore((state) => state.isHydrated);

  // Before rehydration savedIds is always empty, so rendering the filled state
  // would flash on every saved card. Treat it as unsaved until we know.
  const isSaved = isHydrated && savedIds.includes(realEstateId);

  const base = overlay
    ? "h-[3.6rem] w-[3.6rem] rounded-full bg-white/90 hover:bg-white shadow"
    : "h-[4.6rem] w-[5.4rem] rounded-[1rem] border border-border hover:bg-muted";

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remover dos salvos" : "Salvar imóvel"}
      aria-pressed={isSaved}
      title={isSaved ? "Remover dos salvos" : "Salvar imóvel"}
      onClick={(event) => {
        // On a card the whole surface is clickable — saving must not also open
        // the listing.
        event.stopPropagation();
        toggleSaved(realEstateId);
      }}
      className={`flex justify-center items-center shrink-0 cursor-pointer transition-colors ${base} ${className}`}
    >
      {isSaved ? <MdFavorite size={overlay ? 19 : 20} className="text-red-500" /> : <MdFavoriteBorder size={overlay ? 19 : 20} className="text-red-500" />}
    </button>
  );
}
