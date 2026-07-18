"use client";

import { useEffect, useState } from "react";

/**
 * Delay a rapidly changing value. Used to keep dragging a filter slider from
 * firing a request on every intermediate value.
 */
export function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
