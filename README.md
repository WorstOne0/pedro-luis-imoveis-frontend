# Pedro Luis Imóveis — Frontend

> Public listings site for a real estate broker in Cascavel/PR. Map-first
> browsing, district filtering, and per-listing pages with social link previews.

One of five repositories that make up the product:

| Repository | Role |
|---|---|
| **frontend** (this one) | Public site — map + listings |
| dashboard | Admin panel — listing CRUD, uploads, auth |
| backend | REST API |
| images | Upload, resize and serve photos/video |
| database | MongoDB container + backup scripts |

---

## Features

- **Map-first browsing** — Google Maps with a marker per listing, custom pins
  per property type, and grid clustering that collapses overlapping pins into a
  count bubble.
- **District overlays** — the city's 32 neighbourhood polygons. Clicking one
  filters to it; the Bairro multiselect and the map read and write the same
  selection, so they never disagree.
- **Instant filtering** — type, price, rooms, bathrooms, area and district apply
  with no request per keystroke or slider drag.
- **Price histogram** with a fixed-bounds range slider; out-of-range bars stay
  visible and recolour rather than vanishing.
- **Map tools** — layer menu, compass (heading + tilt reset), zoom, click-to-
  measure distance with a running total, geolocation, fullscreen.
- **Listing pages** — image gallery, feature list, map, similar listings, and
  WhatsApp contact.
- **SEO and link previews** — server-rendered metadata, a generated OpenGraph
  card for the site, and per-listing previews carrying the listing's own photo,
  price and stats.
- **Dark / light mode**, system-aware with a manual toggle.

---

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 ·
shadcn/ui · Zustand · SWR · `@react-google-maps/api` · MapLibre (`react-map-gl`)
· Framer Motion · Recharts · Firebase Analytics

---

## Getting started

Requires Node 20+, the backend running on `:4000`, and a Google Maps API key.

```bash
npm install
cp .env.example .env     # then fill it in
npm run dev              # http://localhost:3000
```

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base url (defaults to `http://localhost:4000`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site url — **must be the real domain** or social previews break |
| `NEXT_PUBLIC_GOOGLE_MAPS_API` | Google Maps JS API key |
| `NEXT_PUBLIC_WHATSAPP` | Broker WhatsApp, digits only, international format |
| `NEXT_PUBLIC_*` (Firebase) | Analytics config |

All `NEXT_PUBLIC_*` values are **inlined at build time**, so Docker takes them as
build args — changing one needs a rebuild, not a restart.

> `NEXT_PUBLIC_GOOGLE_MAPS_API` reaches the browser by design; that is how the
> Maps JS API works. Protect it with HTTP referrer and API restrictions in the
> Google Cloud console, not by trying to keep it secret.

---

## Project structure

```
src/
  app/
    layout.tsx            server component — site metadata
    providers.tsx         client wrapper (theme, navbar, map provider)
    (home)/
      page.tsx            map + listing sidebar
      _components/        searchbar, card, markers, clustering
      _utils/             client-side filtering
    real_estate/[id]/
      page.tsx            server component — generateMetadata per listing
      _components/        detail view, gallery, contact card
    about/  contact/
    opengraph-image.tsx   generated 1200×630 social card
  components/             shared only — navbar, maps, district polygons, ui/
  hooks/                  useApiFetch (SWR), useLogEvent
  lib/                    map markers, generated property glyphs, site constants
  services/               axios, google maps loader, theme, firebase
  store/                  zustand stores
  utils/                  district polygon geometry
```

Route-local code lives beside its route in `_components/` or `_utils/`.
`src/components` is reserved for what more than one route actually uses.

---

## Notes for anyone reading the code

**Filtering is client-side on purpose.** The page already downloads the whole
catalogue — the map draws a marker per listing and the price histogram needs
every price for its bounds — so asking the API to filter as well was paying
twice for the same answer. `_utils/filter_real_estate.ts` mirrors the backend's
query rules; if you change one, change the other. The API keeps its filters for
the dashboard and for whenever the catalogue outgrows a single fetch.

**Map markers are self-contained SVG data URIs.** `lib/property_glyphs.ts` is
generated from `public/property_svg/` — don't hand-edit it. The glyph has to be
inlined because an `<image href>` pointing at `/public` is blocked inside a
`data:` URI.

**HTML overlays must render outside `<GoogleMap>`.** Google injects its own
containers at very high z-indexes, so a panel placed among the map's children is
drawn but buried. Vector overlays go inside; HTML goes outside.

**District names differ between the map data and the listings** — case, accents,
and two outright spelling mismatches. `normalizeDistrict()` and an alias table
bridge it, and a polygon click resolves to the listing spelling before anything
reaches the API.

---

## Known limitations

- 17 of the 25 current listings carry `{lat: 0, lng: 0}` coordinates from a
  legacy import, so the map shows 8 of them. A data problem, not a code one —
  those listings need geocoding.
- No automated tests. Verification is manual, against the running backend.
- `utils/districts_geo.js` carries a few misspelled district names.

---

## Project status and contributions

This is a commissioned project built for a specific business. It is **not** an
open source project and is not accepting contributions, feature requests or
pull requests.

## Copyright and licence

**Copyright © 2026 Lucca Gabriel. All rights reserved.**

This repository is published so the source can be **read**, as a portfolio piece
and for reference. It is deliberately published **without a licence**, which
under default copyright law means all rights are reserved.

Viewing and forking within GitHub are permitted by GitHub's Terms of Service.
That does **not** grant permission to use, copy, modify, deploy or redistribute
this code. Third-party dependencies keep their own licences, and Pedro Luis
Imóveis brand assets are the property of their owner.

See [`COPYRIGHT.md`](COPYRIGHT.md) for the full terms.
