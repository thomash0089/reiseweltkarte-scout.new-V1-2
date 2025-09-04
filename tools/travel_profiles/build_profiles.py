import json, os, tempfile, argparse, zipfile, urllib.request
import numpy as np
import pandas as pd
import geopandas as gpd
import xarray as xr
import rasterio
from rasterio.transform import Affine
from shapely.geometry import shape

# This pipeline can read pre-downloaded ERA5 NetCDF files, or download WorldClim 2.1 (10 arcmin) on-the-fly.

parser = argparse.ArgumentParser()
parser.add_argument('--admin', default='../../wandermap/public/data/admin1/admin1_50m.geojson')
parser.add_argument('--out', required=True)
parser.add_argument('--provider', choices=['era5','worldclim'], default='worldclim')
parser.add_argument('--t2m', default='data/era5land_t2m_monthly.nc')
parser.add_argument('--tp', default='data/era5land_tp_monthly.nc')
parser.add_argument('--sst', default='data/era5_sst_monthly.nc')
args = parser.parse_args()

admin = gpd.read_file(args.admin)
admin = admin.to_crs(4326)

if args.provider == 'era5':
    # Open datasets (user must provide files or add cdsapi download step)
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

else:
    # WorldClim 2.1 (10 arcmin) quick path
    tmpdir = tempfile.mkdtemp()
    tavg_zip = os.path.join(tmpdir, 'wc2.1_10m_tavg.zip')
    prec_zip = os.path.join(tmpdir, 'wc2.1_10m_prec.zip')
    if not os.path.exists(tavg_zip):
        urllib.request.urlretrieve('https://biogeo.ucdavis.edu/data/worldclim/v2.1/base/wc2.1_10m_tavg.zip', tavg_zip)
    if not os.path.exists(prec_zip):
        urllib.request.urlretrieve('https://biogeo.ucdavis.edu/data/worldclim/v2.1/base/wc2.1_10m_prec.zip', prec_zip)
    with zipfile.ZipFile(tavg_zip) as z: z.extractall(tmpdir)
    with zipfile.ZipFile(prec_zip) as z: z.extractall(tmpdir)
    # Build arrays by month using rasterio (values: tavg in °C *10)
    tavg_files = [os.path.join(tmpdir, f'wc2.1_10m_tavg_{i:02d}.tif') for i in range(1,13)]
    prec_files = [os.path.join(tmpdir, f'wc2.1_10m_prec_{i:02d}.tif') for i in range(1,13)]
    t2m_world = [rasterio.open(fp) for fp in tavg_files]
    tp_world  = [rasterio.open(fp) for fp in prec_files]
    # Helpers to sample by lon/lat
    def sample_world(arr: rasterio.io.DatasetReader, lon, lat):
        row, col = arr.index(lon, lat)
        val = arr.read(1)[row, col]
        return float(val)

# Build output
features = []

for idx, feat in admin.iterrows():
    geom = feat.geometry
    props = feat
    lon = float(geom.centroid.x)
    lat = float(geom.centroid.y)

    if args.provider == 'era5':
        # Use xarray interpolation from monthly arrays
        tvals = [float(t2m.sel(month=m).sel(longitude=lon, latitude=lat, method='nearest').values) for m in range(1,13)] if 'month' in t2m.dims else [float(t2m.sel(longitude=lon, latitude=lat, method='nearest').values)]*12
        pvals = [float(tp.sel(month=m).sel(longitude=lon, latitude=lat, method='nearest').values) for m in range(1,13)] if 'month' in tp.dims else [float(tp.sel(longitude=lon, latitude=lat, method='nearest').values)]*12
        svals = [float(sst.sel(month=m).sel(longitude=lon, latitude=lat, method='nearest').values) for m in range(1,13)] if 'month' in getattr(sst,'dims',[]) else None
    else:
        # WorldClim sampling (tavg °C*10, precip mm)
        tvals = [sample_world(t2m_world[m-1], lon, lat)/10.0 for m in range(1,13)]
        pvals = [sample_world(tp_world[m-1], lon, lat) for m in range(1,13)]
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
