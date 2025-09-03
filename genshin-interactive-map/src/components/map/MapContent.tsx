import React, { useEffect, useState, useRef } from 'react';
import { useMapContext, TreasureChest, Oculus, Waypoint, Material, RouteWaypoint } from '../../context/MapContext';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Mock data for the demo
const mockChests: TreasureChest[] = [
  {
    id: 1,
    position: [0, 0],
    region: 'Mondstadt',
    location: 'Starfell Valley',
    description: 'Hidden behind rocks near the lake',
    looted: false
  },
  {
    id: 2,
    position: [10, 10],
    region: 'Liyue',
    location: 'Minlin',
    description: 'Inside cave entrance',
    looted: false
  }
];

const mockOculi: Oculus[] = [
  {
    id: 1,
    position: [5, 5],
    region: 'Mondstadt',
    location: 'Windrise',
    description: 'Top of the large tree',
    collected: false,
    element: 'anemo'
  },
  {
    id: 2,
    position: [15, 15],
    region: 'Liyue',
    location: 'Guyun Stone Forest',
    description: 'Hidden in between stones',
    collected: false,
    element: 'geo'
  }
];

const mockWaypoints: Waypoint[] = [
  {
    id: 1,
    position: [7, 7],
    region: 'Mondstadt',
    name: 'Mondstadt City',
    unlocked: true
  },
  {
    id: 2,
    position: [17, 17],
    region: 'Liyue',
    name: 'Liyue Harbor',
    unlocked: true
  }
];

const mockMaterials: Material[] = [
  {
    id: 1,
    position: [3, 3],
    type: 'plant',
    region: 'Mondstadt',
    location: 'Starfell Lake',
    quantity: 3,
    respawnHours: 48
  },
  {
    id: 2,
    position: [13, 13],
    type: 'ore',
    region: 'Liyue',
    location: 'Mt. Tianheng',
    quantity: 2,
    respawnHours: 72
  }
];

const MapContent: React.FC = () => {
  const { state, dispatch } = useMapContext();
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Set up map when component mounts
  const mapSetup = () => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Set map view to a default position
    map.setView([0, 0], 5);
    
    // Add markers based on active layers
    addMarkers();
    
    setMapReady(true);
  };
  
  // Add markers based on active layers
  const addMarkers = () => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
    
    // Add TileLayer (this would be a custom Genshin Impact tileset in a real implementation)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data © OpenStreetMap contributors'
    }).addTo(map);
    
    // Add treasure chest markers if layer is active
    if (state.activeLayers.treasureChests.common) {
      mockChests.filter(chest => chest.description.includes('common')).forEach(chest => {
        const marker = L.marker(chest.position, {
          icon: createCustomIcon('chest', 'common')
        }).addTo(map);
        
        marker.bindPopup(`
          <strong>${chest.region} - Common Chest</strong><br>
          ${chest.description}<br>
          <button onclick="document.dispatchEvent(new CustomEvent('lootChest', { detail: ${chest.id} }))">
            Mark as Looted
          </button>
        `);
      });
    }
    
    if (state.activeLayers.treasureChests.exquisite) {
      mockChests.filter(chest => chest.description.includes('exquisite')).forEach(chest => {
        const marker = L.marker(chest.position, {
          icon: createCustomIcon('chest', 'exquisite')
        }).addTo(map);
        
        marker.bindPopup(`
          <strong>${chest.region} - Exquisite Chest</strong><br>
          ${chest.description}<br>
          <button onclick="document.dispatchEvent(new CustomEvent('lootChest', { detail: ${chest.id} }))">
            Mark as Looted
          </button>
        `);
      });
    }
    
    if (state.activeLayers.treasureChests.precious) {
      mockChests.filter(chest => chest.description.includes('precious')).forEach(chest => {
        const marker = L.marker(chest.position, {
          icon: createCustomIcon('chest', 'precious')
        }).addTo(map);
        
        marker.bindPopup(`
          <strong>${chest.region} - Precious Chest</strong><br>
          ${chest.description}<br>
          <button onclick="document.dispatchEvent(new CustomEvent('lootChest', { detail: ${chest.id} }))">
            Mark as Looted
          </button>
        `);
      });
    }
    
    // Add oculi markers if layer is active
    if (state.activeLayers.oculi.anemoculi) {
      mockOculi.filter(oculus => oculus.element === 'anemo').forEach(oculus => {
        const marker = L.marker(oculus.position, {
          icon: createCustomIcon('oculus', 'anemo')
        }).addTo(map);
        
        marker.bindPopup(`
          <strong>Anemoculus</strong><br>
          ${oculus.description}<br>
          <button onclick="document.dispatchEvent(new CustomEvent('collectOculus', { detail: ${oculus.id} }))">
            Mark as Collected
          </button>
        `);
      });
    }
    
    // Add waypoint markers if layer is active
    if (state.activeLayers.waypoints) {
      mockWaypoints.forEach(waypoint => {
        const marker = L.marker(waypoint.position, {
          icon: createCustomIcon('waypoint')
        }).addTo(map);
        
        marker.bindPopup(`
          <strong>${waypoint.name}</strong><br>
          Region: ${waypoint.region}<br>
          Status: ${waypoint.unlocked ? 'Unlocked' : 'Locked'}
        `);
      });
    }
    
    // Add material markers if layer is active
    if (state.activeLayers.materials.plants || state.activeLayers.materials.ores) {
      mockMaterials.forEach(material => {
        if ((material.type === 'plant' && state.activeLayers.materials.plants) ||
            (material.type === 'ore' && state.activeLayers.materials.ores)) {
          const marker = L.marker(material.position, {
            icon: createCustomIcon('material', material.type)
          }).addTo(map);
          
          marker.bindPopup(`
            <strong>${material.type.charAt(0).toUpperCase() + material.type.slice(1)}</strong><br>
            Location: ${material.location}<br>
            Quantity: ${material.quantity}<br>
            Respawn: ${material.respawnHours} hours
          `);
        }
      });
    }
    
    // If in route planning mode, add a click handler to the map
    if (state.routePlanningMode) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const waypoint: RouteWaypoint = {
          id: Date.now(),
          position: [e.latlng.lat, e.latlng.lng] as [number, number],  // Use type assertion to match the expected type
          name: `Waypoint ${state.currentRoute.length + 1}`,
          description: 'Custom waypoint'
        };
        dispatch({ type: 'ADD_ROUTE_WAYPOINT', waypoint });
      });
    } else {
      map.off('click');
    }
    
    // Draw the current route if it exists
    if (state.currentRoute.length > 0) {
      const points = state.currentRoute.map(wp => wp.position);
      
      // Create a polyline for the route
      L.polyline(points, {
        color: '#FF5722',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);
      
      // Add markers for each waypoint
      state.currentRoute.forEach((waypoint, index) => {
        const marker = L.marker(waypoint.position, {
          icon: createCustomIcon('waypoint', 'route')
        }).addTo(map);
        
        marker.bindPopup(`
          <strong>${waypoint.name}</strong><br>
          ${waypoint.description}<br>
          <small>Waypoint ${index + 1} of ${state.currentRoute.length}</small>
        `);
      });
    }
  };
  
  // Create custom icons for different marker types
  const createCustomIcon = (type: string, subtype?: string) => {
    // In a real implementation, this would return actual custom icons
    // For this demo, we'll just use colored circle markers
    
    let color = '#4CAF50';  // Default green
    
    switch (type) {
      case 'chest':
        color = subtype === 'common' ? '#9E9E9E' : 
                subtype === 'exquisite' ? '#42A5F5' : 
                subtype === 'precious' ? '#FFC107' : '#4CAF50';
        break;
      case 'oculus':
        color = subtype === 'anemo' ? '#4DD0E1' : 
                subtype === 'geo' ? '#FFD54F' : 
                subtype === 'electro' ? '#9575CD' : 
                subtype === 'dendro' ? '#8BC34A' : '#4CAF50';
        break;
      case 'waypoint':
        color = subtype === 'route' ? '#FF5722' : '#E91E63';
        break;
      case 'material':
        color = subtype === 'plant' ? '#8BC34A' : 
                subtype === 'ore' ? '#78909C' : 
                subtype === 'animal' ? '#FFCA28' : '#4CAF50';
        break;
    }
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${color}; border: 2px solid white;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [0, 0],
        zoom: 5,
        minZoom: 3,
        maxZoom: 10,
        zoomControl: false
      });
      
      mapSetup();
    }
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  // Update markers when active layers change
  useEffect(() => {
    if (mapReady) {
      addMarkers();
    }
  }, [state.activeLayers, state.mapVersion, state.routePlanningMode, state.currentRoute, mapReady]);
  
  // Set up event listener for looting chests
  useEffect(() => {
    const handleLootChest = (e: CustomEvent) => {
      dispatch({ type: 'UPDATE_PROGRESS', progressType: 'chest', id: e.detail });
    };
    
    document.addEventListener('lootChest', handleLootChest as EventListener);
    
    return () => {
      document.removeEventListener('lootChest', handleLootChest as EventListener);
    };
  }, [dispatch]);
  
  // Set up event listener for collecting oculi
  useEffect(() => {
    const handleCollectOculus = (e: CustomEvent) => {
      dispatch({ type: 'UPDATE_PROGRESS', progressType: 'oculi', id: e.detail });
    };
    
    document.addEventListener('collectOculus', handleCollectOculus as EventListener);
    
    return () => {
      document.removeEventListener('collectOculus', handleCollectOculus as EventListener);
    };
  }, [dispatch]);
  
  return (
    <div id="map" style={{ width: '100%', height: '100%' }}></div>
  );
};

export default MapContent;
