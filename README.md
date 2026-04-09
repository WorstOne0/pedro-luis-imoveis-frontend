# Pedro Luis Imóveis — Frontend

> Interactive real estate platform with map-based property browsing, advanced filtering, and detailed property pages.

---

## 🚀 Features

- **Interactive Google Maps** — browse properties via map markers with type-based icons
- **Sidebar Listing** — scrollable property cards synchronized with map selection
- **Advanced Filters** — filter by property type, price range, rooms, bathrooms, garages, and area
- **District Polygons** — neighborhood boundary overlays on the map
- **Property Detail Page** — full image gallery (slideshow), address breakdown, pricing, and WhatsApp contact
- **Dark / Light Mode** — system-aware theme with manual toggle
- **Firebase Analytics** — page view and event tracking

---

## 📸 Preview

The home page displays a full-screen Google Map alongside a floating sidebar containing the search/filter panel and property cards. Clicking a marker scrolls the list to the matching card; clicking a card pans the map to the property. The detail page shows a grid image layout with a fullscreen slideshow.

> Screenshots not included. Run the project locally to preview.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Data Fetching | SWR + Axios |
| Maps | Google Maps API (`@react-google-maps/api`) |
| Analytics | Firebase Analytics |
| Animations | Framer Motion |
| UI Primitives | Radix UI Slider, Lucide React, React Icons |
| Theme | next-themes |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (NavBar, ThemeProvider, MapProvider)
│   ├── page.tsx                # Home — map + sidebar listing
│   ├── real_estate/[id]/
│   │   └── page.tsx            # Property detail page
│   ├── about/page.tsx
│   └── contact/page.tsx
│
├── components/
│   ├── google_maps/            # Map wrapper component
│   ├── district_polygons/      # Neighborhood polygon overlays
│   ├── searchbar/              # Filter panel (type, price, rooms, area)
│   ├── real_estate_card/       # Property listing card
│   ├── slideshow/              # Fullscreen image gallery
│   ├── nav_bar/                # Top navigation
│   ├── modal/                  # Generic modal
│   └── ui/                     # Shared UI primitives (Card, Input, Slider, Chart)
│
├── store/
│   ├── real_estate.tsx         # Property list & selected property
│   ├── auth.tsx                # Auth state
│   └── index.tsx               # Store exports (includes district & searchbar stores)
│
├── services/
│   ├── axios.ts                # Axios instance (base URL config)
│   ├── firebase.ts             # Firebase initialization & analytics helper
│   ├── google_maps.tsx         # MapProvider
│   └── theme_provider.tsx      # next-themes ThemeProvider
│
└── hooks/
    ├── useApiFetch.ts          # SWR + Axios data fetching hook
    ├── useLogEvent.ts          # Firebase Analytics event hook
    └── useMount.ts
```

---

## ⚙️ Installation

**Prerequisites:** Node.js 18+, pnpm

```bash
# Clone the repository
git clone <repo-url>
cd pedro_luis_imoveis_frontend

# Install dependencies
pnpm install
```

Create a `.env.local` file in the project root:

```env
# Firebase
NEXT_PUBLIC_API_KEY=
NEXT_PUBLIC_AUTH_DOMAIN=
NEXT_PUBLIC_PROJECT_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_MESSAGING_SENDER_ID=
NEXT_PUBLIC_APP_ID=
NEXT_PUBLIC_MEASUREMENT_ID=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## ▶️ Usage

```bash
# Development (Turbopack)
pnpm dev

# Production build
pnpm build
pnpm start

# Lint
pnpm lint
```

The app runs on `http://localhost:3000` by default and expects the backend API at `http://localhost:4000`.

---

## 🔌 API Integration

The frontend communicates with a REST backend via `useApiFetch` (SWR + Axios).

| Endpoint | Method | Description |
|---|---|---|
| `/real_estate` | `GET` | Fetch all property listings |
| `/real_estate/:id` | `POST` | Fetch a single property by ID |

The Axios base URL is configured in `src/services/axios.ts`. Update it to point to your backend.

---

## 🧪 Testing

No test suite is configured in the current codebase.

---

## 📌 Roadmap

- [ ] Wire up filter state to API query parameters
- [ ] Implement About and Contact pages
- [ ] Add authentication flow (store scaffolded in `src/store/auth.tsx`)
- [ ] Complete property attributes display on detail page (rooms, bathrooms, garages currently hardcoded)
- [ ] Add loading skeletons and error states

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Open a pull request against `main`

---

## 📄 License

Private project — no license specified.

---

**Short description:** Interactive Brazilian real estate platform with Google Maps browsing, property filtering, and detail pages. Built with Next.js 15 and TypeScript.

**Suggested GitHub tags:** `nextjs`, `real-estate`, `google-maps`, `typescript`, `tailwindcss`, `zustand`, `firebase`, `framer-motion`, `react`
