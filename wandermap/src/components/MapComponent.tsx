import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const MapComponent: React.FC<MapComponentProps> = ({
  destinations,
  selectedDestination,
  onDestinationSelect,
  mapLabelLanguage,
  seasonMonths
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const baseLayerRef = useRef<L.TileLayer | null>(null);

  const adminLayerRef = useRef<L.GeoJSON | null>(null);
  const profilesRef = useRef<ProfilesDB | null>(null);


  // Category colors for markers
  const categoryColors = {
    attractions: '#ef4444', // Red
    natural: '#3b82f6',     // Blue
    adventure: '#10b981',   // Green
    'hidden-gems': '#8b5cf6' // Purple
  };

  // Create custom marker icon
  const createMarkerIcon = (category: string, isSelected: boolean = false) => {
    const color = (categoryColors as any)[category] || '#6b7280';
    const size = isSelected ? 35 : 25;
    
    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size/2}px;
          ${isSelected ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${getCategoryIcon(category)}
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        </style>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'attractions': return '🏠';
      case 'natural': return '🌲';
      case 'adventure': return '🏄';
      case 'hidden-gems': return '🔍';
      default: return '📍';
    }
  };

  const createOSMLayer = (lang: 'en' | 'de' | 'local') => {
    const commonOpts: L.TileLayerOptions = {
      maxZoom: 19,
      detectRetina: true,
      keepBuffer: 4,
      updateWhenIdle: true,
      noWrap: true,
      zoomOffset: 1, // use higher-zoom tiles to render larger labels
      maxNativeZoom: 19
    };
    if (lang === 'de') {
      return L.tileLayer('https://tile.openstreetmap.de/tile/{z}/{x}/{y}.png', {
        ...commonOpts,
        attribution: '&copy; OpenStreetMap contributors, style: OSM DE'
      });
    }
    // local and en fallback
    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      ...commonOpts,
      attribution: '&copy; OpenStreetMap contributors'
    });
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 3,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        worldCopyJump: false
      });

      // Constrain to one world copy
      const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
      map.setMaxBounds(bounds);
      (map as any).options.maxBoundsViscosity = 1.0;

      // OSM base layer with zoomOffset for larger labels
      const base = createOSMLayer(mapLabelLanguage);
      base.addTo(map);
      baseLayerRef.current = base;

      // Add fullscreen control
      const FullscreenControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
          const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          div.innerHTML = `
            <a href="#" title="Fullscreen" role="button" aria-label="Fullscreen" 
               style="background: white; color: #333; text-decoration: none; padding: 5px; display: block;">
              ⛶️
            </a>
          `;
          div.onclick = (e) => {
            e.preventDefault();
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              mapRef.current?.requestFullscreen();
            }
          };
          return div;
        }
      });
      new (FullscreenControl as any)().addTo(map);

      // Add geolocation control
      const GeolocationControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
          const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
          div.innerHTML = `
            <a href="#" title="Find my location" role="button" aria-label="Find my location"
               style="background: white; color: #333; text-decoration: none; padding: 5px; display: block;">
              📍
            </a>
          `;
          div.onclick = (e) => {
            e.preventDefault();
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  map.setView([latitude, longitude], 10);
                  L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup('You are here!')
                    .openPopup();
                },
                (error) => {
                  console.error('Geolocation error:', error);
                  alert('Unable to retrieve your location');
                }
              );
            } else {
              alert('Geolocation is not supported by this browser');
            }
          };
          return div;
        }
      });
      new (GeolocationControl as any)().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        if (adminLayerRef.current) {
          try { mapInstanceRef.current.removeLayer(adminLayerRef.current); } catch {}
          adminLayerRef.current = null;
        }

        if (baseLayerRef.current) {
          try { mapInstanceRef.current.removeLayer(baseLayerRef.current); } catch {}
          baseLayerRef.current = null;
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Language switch: swap OSM tile source (DE vs Standard)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const newBase = createOSMLayer(mapLabelLanguage);
    if (baseLayerRef.current) {
      try { mapInstanceRef.current.removeLayer(baseLayerRef.current); } catch {}
    }
    newBase.addTo(mapInstanceRef.current);
    baseLayerRef.current = newBase;
  }, [mapLabelLanguage]);

  // Admin-1 overlay coloring by season/activity
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const load = async () => {
      try {
        // Load profiles (if present)
        if (!profilesRef.current) {
          try {
            const p = await fetch('/data/travel/profiles_admin1.json');
            if (p.ok) profilesRef.current = await p.json();
          } catch {}
          if (!profilesRef.current) {
            try {
              const p2 = await fetch('/data/travel/profiles_admin1.sample.json');
              if (p2.ok) profilesRef.current = await p2.json();
            } catch {}
          }
        }
        const resp = await fetch('/data/admin1/admin1_50m.geojson');
        const geo = await resp.json();
        if (adminLayerRef.current) {
          try { mapInstanceRef.current!.removeLayer(adminLayerRef.current); } catch {}
          adminLayerRef.current = null;
        }
        const layer = L.geoJSON(geo as any, {
          style: (feature: any) => {
            const id = feature.properties?.adm1_code || String(feature.properties?.ne_id || feature.properties?.name_en);
            const rec = profilesRef.current?.features.find(f => f.id === id);
            const lat = feature.properties?.latitude ?? feature.properties?.LATITUDE ?? feature.properties?.lat ?? 0;
            const lon = feature.properties?.longitude ?? feature.properties?.LONGITUDE ?? feature.properties?.lon ?? 0;
            let rating: 'best'|'good'|'other'|'bad';
            let hazards: string[] = [];
            if (seasonMonths && seasonMonths.length) {
              hazards = hazardsFor(lat, lon, seasonMonths);
            }
            if (hazards.length) {
              rating = 'bad';
            } else if (rec && seasonMonths && seasonMonths.length) {
              rating = rateRegion((feature as any).activity || 'city', seasonMonths, rec);
            } else {
              const admin = feature.properties?.admin;
              const name = feature.properties?.name_en || feature.properties?.name;
              rating = scoreRegionByMonths(lat, admin, name, seasonMonths || []);
            }
            if (rating === 'best') return { color: '#16a34a', weight: 0.5, fillColor: '#16a34a', fillOpacity: 0.35 };
            if (rating === 'good') return { color: '#eab308', weight: 0.5, fillColor: '#eab308', fillOpacity: 0.25 };
            if (rating === 'bad') return { color: '#ef4444', weight: 0.5, fillColor: '#ef4444', fillOpacity: 0.25 };
            return { color: '#00000000', weight: 0, fillColor: '#00000000', fillOpacity: 0 };
          },
          onEachFeature: (feature: any, l: L.Layer) => {
            const id = feature.properties?.adm1_code || String(feature.properties?.ne_id || feature.properties?.name_en);
            const rec = profilesRef.current?.features.find(f => f.id === id);
            const name = feature.properties?.name_en || feature.properties?.name;
            const admin = feature.properties?.admin;
            const lat = feature.properties?.latitude ?? feature.properties?.lat ?? 0;
            const lon = feature.properties?.longitude ?? feature.properties?.lon ?? 0;
            const haz = seasonMonths && seasonMonths.length ? hazardsFor(lat, lon, seasonMonths) : [];
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            let bestList = '';
            if (rec) {
              const bestMonths: number[] = [];
              for (let m=0;m<12;m++){ if (rateMonth('city', m, rec) === 'best') bestMonths.push(m); }
              bestList = bestMonths.map(m=>months[m]).join(', ');
            }
            const reason = haz.length ? `Risiko: ${haz.join(', ')}` : (rec ? 'Klimatische Eignung nach ERA5' : 'Heuristische Eignung');
            (l as any).bindTooltip(`<div class="text-xs"><div class="font-semibold">${name}${admin ? ' · ' + admin : ''}</div><div>${reason}</div>${bestList ? `<div>Beste Monate: ${bestList}</div>`:''}</div>`, { sticky: true });
            l.on('mouseover', () => {(l as any).setStyle?.({ weight: 1.2 });});
            l.on('mouseout', () => {(l as any).setStyle?.({ weight: 0.5 });});
          }
        });
        layer.addTo(mapInstanceRef.current!);
        adminLayerRef.current = layer;
      } catch (e) {
        console.warn('Failed to load admin1 overlay', e);
      }
    };

    load();
  }, [seasonMonths]);

  // Update markers when destinations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    destinations.forEach(destination => {
      const isSelected = selectedDestination?.id === destination.id;
      const marker = L.marker(
        destination.coordinates,
        { icon: createMarkerIcon(destination.category, isSelected) }
      );

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-48">
          <h3 class="font-bold text-lg text-gray-900 mb-1">${destination.name}</h3>
          <p class="text-gray-600 text-sm mb-2">${destination.description}</p>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span class="flex items-center">
              <span class="text-yellow-500 mr-1">⭐</span>
              ${destination.rating}/5
            </span>
            <span class="font-medium">${destination.price}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      
      // Add click handler
      marker.on('click', () => {
        onDestinationSelect(destination);
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
  }, [destinations, selectedDestination, onDestinationSelect]);

  // Center map on selected destination
  useEffect(() => {
    if (selectedDestination && mapInstanceRef.current) {
      mapInstanceRef.current.setView(selectedDestination.coordinates, 8, {
        animate: true,
        duration: 1
      });
    }
  }, [selectedDestination]);

  return (
    <div className="map-container relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Categories</h4>
        <div className="space-y-1">
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center space-x-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: color as string }}
              ></div>
              <span className="text-gray-700 dark:text-gray-300 capitalize">
                {category === 'hidden-gems' ? 'Hidden Gems' : category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
