import json, os, tempfile, argparse
import numpy as np
import pandas as pd
import geopandas as gpd
import xarray as xr
from shapely.geometry import shape

# NOTE: This is a skeleton pipeline. It assumes NetCDF already downloaded into ./data/*.nc
# Use cdsapi to download ERA5-Land monthly means (t2m, tp) and ERA5 (sst) if needed.

parser = argparse.ArgumentParser()
parser.add_argument('--admin', default='../../wandermap/public/data/admin1/admin1_50m.geojson')
parser.add_argument('--out', required=True)
parser.add_argument('--t2m', default='data/era5land_t2m_monthly.nc')
parser.add_argument('--tp', default='data/era5land_tp_monthly.nc')
parser.add_argument('--sst', default='data/era5_sst_monthly.nc')
args = parser.parse_args()

admin = gpd.read_file(args.admin)
admin = admin.to_crs(4326)

# Open datasets (user must provide files)
ds_t2m = xr.open_dataset(args.t2m)  # K
ds_tp  = xr.open_dataset(args.tp)   # m
try:
    ds_sst = xr.open_dataset(args.sst) # K
except Exception:
    ds_sst = None

# Convert to monthly climatology (1991–2020) if time dimension present
if 'time' in ds_t2m:
    t2m = ds_t2m['t2m'].groupby('time.month').mean('time') - 273.15
else:
    t2m = ds_t2m['t2m'] - 273.15
if 'time' in ds_tp:
    tp = ds_tp['tp'].groupby('time.month').mean('time') * 1000.0  # m -> mm
else:
    tp = ds_tp['tp'] * 1000.0
if ds_sst is not None:
    if 'time' in ds_sst:
        sst = ds_sst['sst'].groupby('time.month').mean('time') - 273.15
    else:
        sst = ds_sst['sst'] - 273.15
else:
    sst = None

# Build output
features = []

for idx, feat in admin.iterrows():
    geom = feat.geometry
    props = feat
    # Simple point-sample at centroid (fast). For higher fidelity, do polygon mean with rasterio.mask
    lon = float(geom.centroid.x)
    lat = float(geom.centroid.y)

    # Nearest neighbor sample from arrays
    def sample(arr):
        return [float(arr.sel(longitude=lon, latitude=lat, method='nearest').values)] if arr.ndim==2 else [float(arr.sel(longitude=lon, latitude=lat, method='nearest').values) for _ in range(12)]

    # Use xarray interpolation
    tvals = [float(t2m.sel(longitude=lon, latitude=lat, method='nearest').values)] if 'month' not in t2m.dims else [float(t2m.sel(month=m).sel(longitude=lon, latitude=lat, method='nearest').values) for m in range(1,13)]
    pvals = [float(tp.sel(longitude=lon, latitude=lat, method='nearest').values)] if 'month' not in tp.dims else [float(tp.sel(month=m).sel(longitude=lon, latitude=lat, method='nearest').values) for m in range(1,13)]
    if sst is not None:
        svals = [float(sst.sel(month=m).sel(longitude=lon, latitude=lat, method='nearest').values) for m in range(1,13)]
    else:
        svals = None

    features.append({
        'id': props.get('adm1_code') or str(props.get('ne_id') or props.get('name_en') or props.get('name')),
        'lat': lat,
        'admin': props.get('admin'),
        'name': props.get('name_en') or props.get('name'),
        'tmean': tvals,
        'prcp': pvals,
        'sst': svals
    })

out = {
    'meta': { 'source': 'ERA5-Land Monthly Means 1991–2020 (centroid sample)', 'note': 'Replace with polygon means for higher fidelity' },
    'features': features
}

os.makedirs(os.path.dirname(args.out), exist_ok=True)
with open(args.out, 'w', encoding='utf-8') as f:
    json.dump(out, f)

print(f'Wrote {args.out} with {len(features)} regions')
