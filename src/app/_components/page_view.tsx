"use client";

import { useLogEvent } from "@/hooks";

/**
 * Analytics side effect isolated into its own client component, so the page
 * around it can stay a server component and export `metadata`.
 */
export default function PageView({ page, route }: { page: string; route: string }) {
  useLogEvent("page_view", { page, route });

  return null;
}
