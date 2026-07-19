import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Listings the visitor has saved, kept in localStorage.
 *
 * There is no account system, so this is deliberately device-local — the broker
 * gets no visibility into it and it survives nothing but this browser. Only ids
 * are stored: listing data changes, and a stale copy of a price would be worse
 * than a lookup.
 */
type SavedStore = {
  savedIds: string[];
  toggleSaved: (id: string) => void;
  clearSaved: () => void;
  /** True once localStorage has been read, so the UI can avoid a hydration flash. */
  isHydrated: boolean;
};

const useSavedStore = create<SavedStore>()(
  persist(
    (set) => ({
      savedIds: [],
      isHydrated: false,
      toggleSaved: (id: string) =>
        set((state) => ({
          savedIds: state.savedIds.includes(id) ? state.savedIds.filter((saved) => saved !== id) : [...state.savedIds, id],
        })),
      clearSaved: () => set({ savedIds: [] }),
    }),
    {
      name: "pl_saved_real_estate",
      storage: createJSONStorage(() => localStorage),
      // Only the ids are worth persisting; isHydrated is runtime state.
      partialize: (state) => ({ savedIds: state.savedIds }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);

export default useSavedStore;
