"use client";

// Next
import { useEffect, useRef } from "react";
//
import { analyticsEvent } from "@/services";

export const useLogEvent = (eventName: string, params?: Record<string, unknown>) => {
  // Kept in a ref so a fresh `params` object each render does not re-fire the
  // event, while the effect still reads the latest values.
  const latest = useRef({ eventName, params });
  latest.current = { eventName, params };

  useEffect(() => {
    analyticsEvent(latest.current.eventName, latest.current.params);
  }, []);
};
