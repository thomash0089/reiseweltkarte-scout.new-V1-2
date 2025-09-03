# Repository Deep Dive and Recommendations

This document captures the full structure of the repository, key components, and targeted recommendations to evolve the project. It focuses on the WanderMap world map and related apps, with concrete next steps for scaling and UX polish.

## Monorepo Overview

Four independent React + TypeScript applications:

- Root App (`/src`): Genshin Impact Teyvat demo using Leaflet with custom tiles.
- WanderMap (`/wandermap`): Real-world travel explorer with destinations, filters, planner, and dark mode.
- genshin-map (`/genshin-map`): Basic Teyvat viewer with simple CRS.
- genshin-interactive-map (`/genshin-interactive-map`): Advanced Genshin tool with context/state for layers, routes, and achievements.

Each subapp has its own `index.html`, `vite` setup, and `public` assets. No shared workspace tooling; duplication exists across CSS and utility patterns.

## Key Files by App

- WanderMap
  - Entry: `wandermap/src/main.tsx` → `wandermap/src/App.tsx`
  - Map: `wandermap/src/components/MapComponent.tsx`
  - UI: `Header.tsx`, `FilterPanel.tsx`, `DestinationSidebar.tsx`, `SavedDestinations.tsx`, `TripPlanner.tsx`
  - Data: `public/data/destinations.json`
  - Types: `src/types/index.ts`

- genshin-interactive-map
  - Entry: `src/main.tsx` → `src/App.tsx`
  - Context: `src/context/MapContext.tsx` (layer toggles, routes, progress)
  - Map: `src/components/map/*` (ActualMapComponent, FullInteractiveMap, MapContent)
  - Data: `public/data/*.json` (oculi, waypoints, chests, routes, achievements)

- Root Teyvat demo and `genshin-map`: similar patterns with Leaflet and local tiles.

## Map Tile Usage (Before)

- WanderMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (no language control)
- Genshin apps: custom Teyvat tiles and OSM overlays

## Implemented: Label Language Selection (WanderMap)

- Added UI selector (🌐) in `Header` for map label language: English (default), Deutsch, Lokal.
- Persisted preference in `localStorage` (`wandermap-label-language`).
- Switched base tile layers dynamically in `MapComponent`:
  - English: CARTO Voyager `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png` (© OSM, © CARTO)
  - Deutsch: OSM DE `https://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png` (© OSM contributors, Style: OSM DE)
  - Lokal: OSM Standard `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (© OSM)

Files changed:
- `wandermap/src/components/Header.tsx`
- `wandermap/src/components/MapComponent.tsx`
- `wandermap/src/App.tsx`

## Follow-up Enhancements (High Value)

1. True vector tiles with runtime language switching
   - Adopt MapLibre GL with OpenMapTiles/MapTiler vector tiles to switch labels without changing raster sources.
   - Benefits: more languages, dynamic style, better performance/clarity.
   - Approach: Add optional provider with API key via `.env` and graceful fallback to raster.

2. Shared map utilities
   - Extract shared Leaflet utilities (controls, marker factory, styles) to a common package to remove duplication across apps.

3. Marker clustering and performance
   - Use `leaflet.markercluster` or `supercluster` for high-density points to keep UX smooth on zoom/pan.

4. Persist and restore map view
   - Save `center`, `zoom` in localStorage; restore on load.

5. i18n for UI text
   - Integrate `react-i18next` for interface elements (Filter, Planner, Saved, Legends). Coordinate with map label language for a cohesive experience.

6. Accessibility + keyboard navigation
   - Give focus states to controls, ARIA roles for custom Leaflet controls, improve contrast.

7. Offline/error handling for tiles
   - Add retry/fallback tile layer and user feedback when a provider throttles or fails.

8. Data model and content pipeline
   - Validate `destinations.json` with Zod at load time; optional CMS or Google Sheet sync.

9. Theming and design polish
   - Harmonize map UI with brand (colors/typography), add transitions for base layer switch, compact mobile language selector.

10. Testing
   - Add smoke tests for language switching and marker rendering with `vitest` + `@testing-library/react`.

## Notes on Tile Provider Terms

- CARTO basemaps and OSM DE have usage policies and rate limits; consider hosted or key-based providers for production.
- Always keep proper attribution visible; current implementation includes provider credits.

## Next Steps

- Option A (quick win): Add one more English-raster provider (Stamen Toner Lite) as optional fallback.
- Option B (robust): Introduce MapLibre + vector tiles path-guarded behind an env key and a settings toggle.

