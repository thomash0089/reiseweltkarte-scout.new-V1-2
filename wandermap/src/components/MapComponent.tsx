import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Destination } from '../types';

interface MapComponentProps {
  destinations: Destination[];
  selectedDestination: Destination | null;
  onDestinationSelect: (destination: Destination) => void;
  mapLabelLanguage: 'en' | 'de' | 'local';
}

const MapComponent: React.FC<MapComponentProps> = ({
  destinations,
  selectedDestination,
  onDestinationSelect,
  mapLabelLanguage
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const baseLayerRef = useRef<L.TileLayer | null>(null);

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

  const createBaseLayer = (lang: 'en' | 'de' | 'local') => {
    const commonOpts = {
      maxZoom: 19,
      detectRetina: false,
      keepBuffer: 4 as number,
      updateWhenIdle: true
    };

    if (lang === 'de') {
      return L.tileLayer('https://tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
        ...commonOpts,
        attribution: '&copy; OpenStreetMap contributors | Style: OpenStreetMap DE',
        maxNativeZoom: 19,
        zoomOffset: 0
      });
    }

    if (lang === 'en') {
      return L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
        ...commonOpts,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxNativeZoom: 20,
        zoomOffset: 1
      });
    }

    return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      ...commonOpts,
      attribution: '&copy; OpenStreetMap contributors',
      maxNativeZoom: 19,
      zoomOffset: 0
    });
  };

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true
      });

      // Initial base layer
      const base = createBaseLayer(mapLabelLanguage);
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
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        baseLayerRef.current = null;
      }
    };
  }, []);

  // Switch base layer when language changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const newBase = createBaseLayer(mapLabelLanguage);
    if (baseLayerRef.current) {
      try {
        mapInstanceRef.current.removeLayer(baseLayerRef.current);
      } catch {}
    }
    newBase.addTo(mapInstanceRef.current);
    baseLayerRef.current = newBase;
  }, [mapLabelLanguage]);

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
