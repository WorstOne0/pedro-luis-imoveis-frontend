/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlinePhotoLibrary } from "react-icons/md";

/**
 * Hero image plus a 2x2 grid of thumbnails. The last tile is blurred and
 * carries the remaining count, matching the mockup.
 *
 * Everything is driven off the array length: a listing with one photo renders
 * just the hero rather than three broken tiles.
 */
export default function Gallery({ images, title, onOpen }: { images: string[]; title: string; onOpen: (index: number) => void }) {
  const [hero, ...rest] = images;
  const tiles = rest.slice(0, 4);
  const remaining = Math.max(images.length - 5, 0);

  return (
    // Explicit height, not min-height: with only a floor set, the thumbnail
    // grid's own content drove the block past the viewport. 9.5rem is the
    // floating navbar's offset, so the gallery ends 80% down the screen and
    // the title and description below it are visible without scrolling.
    <div className="w-full flex flex-col md:flex-row gap-[1rem] md:h-[calc(80vh-9.5rem)]">
      {/* The photos are what sell the listing, so the hero takes 60% of the
          width and the thumbnails share the rest. */}
      {/* shrink-0 matters: as a flex item the hero would otherwise be squeezed
          by the growing thumbnail grid and end up a fraction of its 60%. */}
      <div
        className="h-[36rem] md:h-full w-full md:w-[60%] md:shrink-0 rounded-[1.2rem] overflow-hidden relative cursor-pointer"
        onClick={() => onOpen(0)}
      >
        <img className="h-full w-full object-cover object-center absolute inset-0" src={hero} alt={`Foto principal — ${title}`} />

        <Link
          href="/"
          onClick={(event) => event.stopPropagation()}
          aria-label="Voltar"
          className="h-[4.4rem] w-[4.4rem] absolute top-[1.2rem] left-[1.2rem] bg-white/90 hover:bg-white rounded-full flex justify-center items-center shadow"
        >
          <FaArrowLeft size={16} />
        </Link>
      </div>

      {tiles.length > 0 && (
        <div className="min-w-0 grow grid grid-cols-2 grid-rows-2 gap-[1rem] h-[24rem] md:h-full">
          {tiles.map((image, index) => {
            // The last visible tile absorbs the "see all" affordance when there
            // are more photos than fit.
            const isOverflowTile = remaining > 0 && index === tiles.length - 1;

            return (
              <div
                key={`gallery_${index}`}
                className="min-h-0 rounded-[1.2rem] overflow-hidden relative cursor-pointer"
                onClick={() => onOpen(index + 1)}
              >
                <img
                  className="h-full w-full object-cover object-center"
                  style={isOverflowTile ? { filter: "blur(3px)" } : undefined}
                  src={image}
                  alt={`${title} — foto ${index + 2}`}
                />

                {isOverflowTile && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white select-none">
                    <MdOutlinePhotoLibrary size={26} />
                    <span className="text-[2rem] font-bold mt-[0.4rem]">+{remaining}</span>
                    <span className="text-[1.3rem]">ver todas</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
