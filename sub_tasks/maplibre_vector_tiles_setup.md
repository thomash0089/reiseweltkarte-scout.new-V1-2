# MapLibre Vector Tiles Setup (WanderMap)

This enables high-quality vector maps with runtime language switching and larger, consistent label sizes across all zoom levels. It falls back to raster tiles automatically if a key is not provided or if vector loading fails.

## What changed
- Added MapLibre GL via `@maplibre/maplibre-gl-leaflet` (keeps existing Leaflet markers/UI).
- WanderMap now prefers a MapTiler vector style (streets-v2). Language options: English (default), Deutsch, Local.
- Increased label text sizes uniformly by patching symbol layers in the style JSON before rendering.
- If `VITE_MAPTILER_KEY` is missing or the vector style fails to load, WanderMap falls back to raster tiles (CARTO Voyager for EN, OSM DE for DE, OSM Standard for Local).

## How to configure
1. Get a MapTiler API key: https://www.maptiler.com/
2. Create a `.env` file in `wandermap/` with:

```
VITE_MAPTILER_KEY=YOUR_KEY_HERE
```

3. Build or run dev as usual.

## Notes
- Language switching updates the vector style at runtime.
- Label sizes are increased via a style patch for all symbol layers. Adjust the interpolate stops in `applyBiggerTextToStyle` if you want different sizing.
- Fallback keeps current raster providers and behavior when no key is supplied.

## Next steps (optional)
- Add a settings UI to toggle between vector/raster explicitly.
- Add additional vector styles (e.g., outdoors/topo) behind a selector.
- Cache the patched style JSON locally to reduce startup latency.
