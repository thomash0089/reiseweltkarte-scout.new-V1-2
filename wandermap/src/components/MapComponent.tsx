import React, { useEffect, useRef } from 'react';
import maplibregl, { Map as MLMap, LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Destination } from '../types';
import { scoreRegionByMonths } from '../utils/seasons';
import { ActivityType } from './ActivitySelector';
import { ProfilesDB, rateRegion, rateMonth } from '../utils/activityProfiles';
import { hazardsFor } from '../utils/hazards';

interface MapComponentProps {
  destinations: Destination[];
  selectedDestination: Destination | null;
  onDestinationSelect: (destination: Destination) => void;
  mapLabelLanguage: 'en' | 'de' | 'local';
  seasonMonths?: number[]; // 0-11
  activity?: ActivityType;
}

const styleURL = 'https://tiles.openfreemap.org/styles/liberty/style.json';

const MapComponent: React.FC<MapComponentProps> = ({
  destinations,
  selectedDestination,
  onDestinationSelect,
  mapLabelLanguage,
  seasonMonths
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MLMap | null>(null);
  const profilesRef = useRef<ProfilesDB | null>(null);
  const adminSourceId = 'admin1';
  const adminLayerId = 'admin1-fill';

  const worldBounds: LngLatBoundsLike = [[-180, -85], [180, 85]];

  const applyLanguageAndSize = (map: MLMap, lang: 'en'|'de'|'local') => {
    const style = map.getStyle();
    if (!style?.layers) return;
    const langKey = lang === 'local' ? ['coalesce',['get','name'],['get','name:latin'],['get','name_en']] : ['coalesce',['get',`name:${lang}`],['get','name:latin'],['get','name']];
    for (const layer of style.layers) {
      if (layer.type === 'symbol') {
        try {
          map.setLayoutProperty(layer.id, 'text-field', langKey as any);
          map.setLayoutProperty(layer.id, 'text-allow-overlap', true as any);
          map.setLayoutProperty(layer.id, 'symbol-avoid-edges', false as any);
          map.setPaintProperty(layer.id, 'text-halo-color', '#ffffff');
          map.setPaintProperty(layer.id, 'text-halo-width', 1.2);
          map.setLayoutProperty(layer.id, 'text-size', [
            'interpolate',['linear'],['zoom'],
            2, 20,
            5, 22,
            8, 24,
            12, 28,
            16, 32
          ] as any);
        } catch {}
      }
    }
  };

  const buildAdminData = async (months?: number[]) => {
    const resp = await fetch('/data/admin1/admin1_50m.geojson');
    const geo = await resp.json();
    if (!profilesRef.current) {
      try { const p = await fetch('/data/travel/profiles_admin1.json'); if (p.ok) profilesRef.current = await p.json(); } catch {}
      if (!profilesRef.current) {
        try { const p2 = await fetch('/data/travel/profiles_admin1.sample.json'); if (p2.ok) profilesRef.current = await p2.json(); } catch {}
      }
    }
    const prof = profilesRef.current;
    for (const f of geo.features) {
      const id = f.properties?.adm1_code || String(f.properties?.ne_id || f.properties?.name_en || f.properties?.name);
      const rec = prof?.features.find((r)=>r.id===id);
      const lat = f.properties?.latitude ?? f.properties?.LATITUDE ?? f.properties?.lat ?? 0;
      const lon = f.properties?.longitude ?? f.properties?.LONGITUDE ?? f.properties?.lon ?? 0;
      let rating: 'best'|'good'|'other'|'bad' = 'other';
      let hazards: string[] = [];
      if (months && months.length) { hazards = hazardsFor(lat, lon, months); }
      if (hazards.length) rating = 'bad';
      else if (rec && months && months.length) rating = rateRegion('city', months, rec);
      else rating = scoreRegionByMonths(lat, f.properties?.admin, f.properties?.name_en||f.properties?.name, months||[]) as any;
      let bestList = '';
      if (rec) {
        const monthsArr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const bestMonths:number[] = [];
        for (let m=0;m<12;m++){ if (rateMonth('city', m, rec) === 'best') bestMonths.push(m); }
        bestList = bestMonths.map(m=>monthsArr[m]).join(', ');
      }
      f.properties.rating = rating;
      f.properties.tooltip = `${f.properties?.name_en||f.properties?.name}${f.properties?.admin? ' · '+f.properties.admin:''}` + (hazards.length? `\nRisiko: ${hazards.join(', ')}` : (rec? '\nKlimatische Eignung nach ERA5/WorldClim' : '\nHeuristische Eignung')) + (bestList? `\nBeste Monate: ${bestList}` : '');
    }
    return geo;
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: styleURL,
      center: [0,0],
      zoom: 2,
      maxBounds: worldBounds,
      renderWorldCopies: false
    });

    map.on('load', async () => {
      applyLanguageAndSize(map, mapLabelLanguage);
      const geo = await buildAdminData(seasonMonths);
      map.addSource(adminSourceId, { type: 'geojson', data: geo });
      map.addLayer({
        id: adminLayerId,
        type: 'fill',
        source: adminSourceId,
        paint: {
          'fill-color': [
            'match', ['get','rating'],
            'best', '#16a34a',
            'good', '#eab308',
            'bad',  '#ef4444',
            '#00000000'
          ],
          'fill-opacity': [
            'case', ['==',['get','rating'],'other'], 0.0, 0.3
          ]
        }
      });
      map.addLayer({ id: adminLayerId+'-outline', type: 'line', source: adminSourceId, paint: { 'line-color':'#ffffff','line-width':0.5,'line-opacity':0.6 } });

      const popup = new maplibregl.Popup({ closeButton:false, closeOnClick:false });
      map.on('mousemove', adminLayerId, (e)=>{
        if (!e.features?.length) return;
        const f = e.features[0];
        const p = f.properties as any;
        popup.setLngLat((e.lngLat)).setHTML(`<div style="font-size:12px;white-space:pre-line">${p.tooltip||''}</div>`).addTo(map);
      });
      map.on('mouseleave', adminLayerId, ()=> popup.remove());

      for (const d of destinations) {
        const el = document.createElement('div');
        el.style.width='28px'; el.style.height='28px'; el.style.border='3px solid white'; el.style.borderRadius='50%'; el.style.boxShadow='0 2px 8px rgba(0,0,0,0.3)'; el.style.background='#10b981'; el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='center'; el.style.color='white'; el.style.fontSize='14px'; el.textContent='•';
        new maplibregl.Marker({ element: el }).setLngLat([d.coordinates[1], d.coordinates[0]] as any).addTo(map);
        el.onclick = ()=> onDestinationSelect(d);
      }
    });

    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  useEffect(()=>{ if (mapInstanceRef.current) applyLanguageAndSize(mapInstanceRef.current, mapLabelLanguage); }, [mapLabelLanguage]);
  useEffect(()=>{ (async ()=>{ if (!mapInstanceRef.current) return; const src = mapInstanceRef.current.getSource(adminSourceId) as any; if (src) src.setData(await buildAdminData(seasonMonths)); })(); }, [seasonMonths]);
  useEffect(()=>{ if (selectedDestination && mapInstanceRef.current) { const [lat,lng]=selectedDestination.coordinates; mapInstanceRef.current.easeTo({ center:[lng,lat], zoom:8, duration:800 }); } }, [selectedDestination]);

  return <div ref={mapRef} className="w-full h-full"/>;
};

export default MapComponent;
