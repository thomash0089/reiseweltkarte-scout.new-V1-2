import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapContainer: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Initialize the map
    const map = L.map(mapContainer.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 4,
      center: [0, 0],
      zoom: 0,
      zoomControl: true,
      attributionControl: false,
    });

    // Define the bounds for Teyvat map
    const bounds = L.latLngBounds([[-1000, -1000], [1000, 1000]]);
    
    // Create custom tile layer using the maps directory
    // Fallback to a solid color if tiles are not available
    const teyvatLayer = L.tileLayer('/maps/teyvat/{z}/{x}/{y}.png', {
      bounds: bounds,
      minZoom: -2,
      maxZoom: 4,
      noWrap: true,
      attribution: 'Genshin Impact Interactive Map Demo',
      errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    });

    // Add the base layer
    teyvatLayer.addTo(map);
    
    // Set map bounds
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);

    // Add some sample markers for demonstration
    const sampleMarkers = [
      {
        position: [100, 200] as L.LatLngTuple,
        title: 'Mondstadt Waypoint',
        description: 'Fast travel point in the City of Freedom',
        type: 'waypoint'
      },
      {
        position: [-150, -100] as L.LatLngTuple,
        title: 'Treasure Chest',
        description: 'Common chest containing Mora and materials',
        type: 'treasure'
      },
      {
        position: [300, -200] as L.LatLngTuple,
        title: 'Crystal Ore',
        description: 'Mining node for weapon enhancement materials',
        type: 'resource'
      },
      {
        position: [-200, 150] as L.LatLngTuple,
        title: 'Domain of Mastery',
        description: 'Challenge domain for talent materials',
        type: 'domain'
      }
    ];

    // Add markers to the map
    sampleMarkers.forEach(marker => {
      const markerIcon = L.divIcon({
        className: `${marker.type}-marker`,
        html: `<div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const leafletMarker = L.marker(marker.position, { icon: markerIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-2">
            <h3 class="text-lg font-semibold text-blue-300 mb-2">${marker.title}</h3>
            <p class="text-slate-300 text-sm">${marker.description}</p>
            <div class="mt-3 flex space-x-2">
              <button class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                Mark as Visited
              </button>
              <button class="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded transition-colors">
                Add Note
              </button>
            </div>
          </div>
        `);
    });

    // Add zoom control styling
    const zoomControl = map.zoomControl;
    if (zoomControl) {
      const zoomElement = zoomControl.getContainer();
      if (zoomElement) {
        zoomElement.style.border = '2px solid #3b82f6';
        zoomElement.style.borderRadius = '8px';
        zoomElement.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
      }
    }

    // Store map instance
    mapInstance.current = map;

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-900">
      {/* Map Header */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
        <h1 className="text-xl font-bold text-blue-300 mb-1">
          Genshin Impact Interactive Map
        </h1>
        <p className="text-slate-300 text-sm">
          Explore the world of Teyvat
        </p>
      </div>

      {/* Map Loading Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] pointer-events-none">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <span className="text-blue-300 font-medium">Loading Teyvat...</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg border border-slate-700"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
      />

      {/* Controls Panel */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-slate-300 text-sm">Map Ready</span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30 max-w-xs">
        <h3 className="text-blue-300 font-semibold mb-3">Map Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-slate-300">Waypoints</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-slate-300">Treasure Chests</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-slate-300">Resources</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-slate-300">Domains</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;