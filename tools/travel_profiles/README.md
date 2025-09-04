# ERA5-Land Travel Profiles (Admin-1)

This pipeline computes monthly climate summaries per Admin-1 region (Natural Earth 50m) from open datasets and exports a compact JSON used by the app.

## Data sources (open)
- ERA5-Land Monthly Means (Copernicus CDS): 2m temperature (t2m), total precipitation (tp), 1991–2020 climatology
- ERA5 Monthly Means: Sea surface temperature (sst) over ocean

## Steps
1. Download monthly fields (NetCDF) via CDS API (see `build_profiles.py`)
2. Compute climatological monthly means (or keep monthly means if you prefer)
3. Zonal statistics per Admin-1 polygon (mean tmean, sum/mean precip, mean SST intersecting coastal cells)
4. Write `public/data/travel/profiles_admin1.json` with schema:
```
{
  meta: { source: 'ERA5-Land 1991–2020', note?: string },
  features: [{ id, lat, admin, name, tmean[12], prcp[12], sst[12]? }]
}
```

## Thresholds (can be tuned in app)
- beach: sst ≥ 23°C, air ≥ 22°C, precip ≤ 80 mm
- hike: 10–22°C, precip ≤ 90 mm
- city: 12–27°C, precip ≤ 100 mm

## Run
Create `cdsapirc` with your CDS key and run:
```
pip install -r requirements.txt
python build_profiles.py --out ../../wandermap/public/data/travel/profiles_admin1.json
```

> The app automatically prefers this JSON; if missing, it falls back to a heuristic.
