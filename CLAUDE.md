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
  app/            App Router pages
  components/     <name>/index.tsx, re-exported from components/index.ts
  hooks/          useApiFetch, useDebounce, useMount, useLogEvent
  services/       axios instance, google maps, theme provider, firebase
  store/          zustand stores, re-exported from store/index.tsx
```

Import via `@/components`, `@/hooks`, `@/store`, `@/services`.

## Rules that matter here

- **Never hardcode the API url.** Use the axios instance in `services/axios.ts`
  and pass relative paths (`/real_estate`). The base url is
  `NEXT_PUBLIC_API_URL`.
- **Property types are `apartment | house | land | shop | sobrado`** — matching
  the backend enum. The codebase used to say `apartament`, which silently broke
  every type filter and forced one map icon for all listings.
- **Filters must reach the API.** Filter state lives in
  `components/searchbar/store.tsx`; `toQueryString` serialises it. Do not keep
  filter state in local `useState` — that is how it ended up decorative.
- Debounce anything that fires a request on drag or keystroke (`useDebounce`).
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

## Known gaps

- Everything is `"use client"`, so the site has no SSR and no SEO. For a
  listings site that is the biggest outstanding problem.
- Firebase analytics 400s on every load; the API key is invalid.
- `/about` and `/contact` are stubs.
