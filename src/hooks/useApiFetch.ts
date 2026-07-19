"use client";

import useSWR from "swr";
import axiosInstance from "@/services/axios";

/**
 * GET a url from the API and keep it fresh.
 *
 * The url *is* the cache key, so two components asking for the same url share
 * one request, and changing the url (a new filter, a new id) refetches on its
 * own. Nothing is copied into a store: the data lives here, and components read
 * it from the return value.
 *
 *   const { data, isLoading } = useApiFetch<RealEstate[]>("/real_estate?type=house");
 *
 * Pass `null` as the url to skip the request — useful when it depends on
 * something not loaded yet.
 */
export const useApiFetch = <T,>(url: string | null) => {
  const { data, error, isLoading, mutate } = useSWR(url, async (path: string) => {
    const response = await axiosInstance.get(path);
    return response.data;
  });

  return {
    data: data?.payload as T | undefined,
    total: data?.total as number | undefined,
    isLoading,
    error,
    // Call after a write to pull fresh data for this url.
    refresh: mutate,
  };
};
