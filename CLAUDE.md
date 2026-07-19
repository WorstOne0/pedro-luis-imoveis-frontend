# pedro_luis_imoveis_frontend

Public listings site for Pedro Luis Imóveis. Next.js 16 (App Router, Turbopack),
React 19, Tailwind 4, shadcn/ui, Zustand, SWR, Google Maps, Firebase analytics.

Talks to `pedro_luis_imoveis_backend` on `:4000`.

## Working agreements

**Do not commit unless I ask.** Leave changes in the working tree so I can
review the diff. Describe what changed and let me decide.

- Portuguese for all UI copy; English for code and comments.
- Do not add dependencies without saying so first.
- Verify in a browser against the running backend — `next build` passing proves
  very little here. Check the console: this project has had real hydration bugs
  that only show up at runtime.

## Layout

```
src/
  app/
    layout.tsx          server component — holds metadata; client bits in providers.tsx
    (home)/
      page.tsx          map + list
      _components/      searchbar, real_estate_card, map_markers, use_marker_clusters
      _utils/           filter_real_estate
    real_estate/[id]/
      page.tsx          server component — generateMetadata for link previews
      _components/      detail_view (the client half), gallery, contact_card
    about/ contact/
    opengraph-image.tsx  icon.png  apple-icon.png
  components/     genuinely shared only — nav_bar, google_maps, district_polygons, ui/
  hooks/          useApiFetch, useLogEvent
  lib/            map_marker, property_glyphs (generated), site
  services/       axios instance, google maps, theme provider, firebase
  store/          zustand stores, re-exported from store/index.tsx
```

Import via `@/components`, `@/hooks`, `@/store`, `@/services`, `@/lib`.

**Route-local code lives beside its route** in `_components/` or `_utils/`.
`src/components` is only for what more than one route uses.

**`layout.tsx` and `real_estate/[id]/page.tsx` must stay server components.**
`"use client"` silently disables `metadata` and `generateMetadata` — that is why
the site once shipped with no `<title>`, and why listing links had no preview.

## Rules that matter here

- **Never hardcode the API url.** Use the axios instance in `services/axios.ts`
  and pass relative paths (`/real_estate`). The base url is
  `NEXT_PUBLIC_API_URL`.
- **Property types are `apartment | house | land | shop | sobrado`** — matching
  the backend enum. The codebase used to say `apartament`, which silently broke
  every type filter and forced one map icon for all listings.
- **Filtering happens in the browser, not the API.** The page fetches
  `/real_estate` once — it needs every listing anyway for the map markers and
  the price histogram — and `_utils/filter_real_estate.ts` narrows it. That file
  mirrors the backend's query rules; change one, change the other.
- Filter state lives in `_components/searchbar/store.tsx`. Do not keep it in
  local `useState` — that is how it ended up decorative.
- **Never pass `= []` as a default for hook data** that feeds an effect's deps.
  A literal builds a new array every render; that caused a "Maximum update depth
  exceeded" loop in the clustering hook. Use a module-scope `EMPTY` constant.
- **`ThemeProvider` must stay inside `<body>`.** It injects a `<script>`, and a
  script as a direct child of `<html>` is invalid HTML that breaks hydration.
- Anything depending on the resolved theme needs a mount guard, including
  `aria-label` — not just the icon.
- Never index `images[0]` / `images[1]` blindly; listings have 0 to 10 photos.
- Sizes use `rem` arbitrary values (`text-[2.2rem]`); root font-size is 62.5%,
  so `1rem = 10px`.

## Environment

`NEXT_PUBLIC_API_URL` `NEXT_PUBLIC_GOOGLE_MAPS_API` and the Firebase
`NEXT_PUBLIC_*` set. All are inlined at build time, so Docker takes them as
build args — changing one needs a rebuild, not a restart.

## Map

- `lib/map_marker.ts` builds pins as self-contained SVG data URIs. The glyphs in
  `lib/property_glyphs.ts` are **generated** from `public/property_svg/*.svg` —
  do not hand-edit. They must travel inline: an `<image href>` to `/public` is
  blocked inside a `data:` URI.
- `_components/use_marker_clusters.ts` is a grid clusterer. `hasRealPosition()`
  there is the guard for the `{lat: 0, lng: 0}` data problem.
- **HTML overlays must render outside `<GoogleMap>`.** Google injects its own
  containers at very high z-indexes, so a panel among the map's children is
  drawn but buried. Vector overlays (`PolygonF`, `MarkerF`, `PolylineF`) go
  inside. See `components/google_maps/_components/distance_tool.tsx`.
- The site navbar is `fixed` at `z-50` over the map — do not put map UI at the
  top centre.

## Districts

The map polygons and the listing data spell districts differently: case,
accents, and two outright mismatches (`BRAZMADEIRA`/`Brasmadeira`,
`ESMERALDA`/`Esmerald`). `normalizeDistrict()` and `DISTRICT_ALIASES` in the
searchbar store bridge it. A polygon click resolves to the **catalogue's**
spelling before the value is stored, because the API is accent-sensitive.

Selection is one shared list (`filter.district`) read by both the map and the
multiselect. "All selected" is an **empty array**, not 32 entries.

## Known gaps

- Firebase analytics is configured but unverified end to end.
- The `{lat: 0, lng: 0}` data problem means the map shows 8 of 25 listings —
  see the root `CLAUDE.md`.
- `default` and `mini` card variants exist but only `preview` and `mini` are
  currently used.
