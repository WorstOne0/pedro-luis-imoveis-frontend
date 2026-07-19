"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const THUMB_CLASS =
  "block h-[2.5rem] w-[2.5rem] rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  ({ className, ...props }, ref) => {
    // Radix needs one Thumb per value. Read whichever prop is in use so the
    // slider works controlled (`value`) as well as uncontrolled
    // (`defaultValue`) — keying off defaultValue alone dropped the second
    // handle the moment the component became controlled.
    const thumbCount = props.value?.length ?? props.defaultValue?.length ?? 1;

    return (
      <SliderPrimitive.Root ref={ref} className={cn("relative flex w-full touch-none select-none items-center", className)} {...props}>
        <SliderPrimitive.Track className="relative h-[2rem] w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>

        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb key={`slider_thumb_${index}`} className={THUMB_CLASS} />
        ))}
      </SliderPrimitive.Root>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
