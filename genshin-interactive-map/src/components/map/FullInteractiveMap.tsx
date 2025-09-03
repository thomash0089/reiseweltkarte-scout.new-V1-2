import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useMapContext } from '../../context/MapContext';
import MapContent from './MapContent';

const FullInteractiveMap: React.FC = () => {
  const { state } = useMapContext();
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Leaflet marker fix
    const initializeLeaflet = async () => {
      try {
        const L = await import('leaflet');
        
        // Fix Leaflet default marker icons
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
      } catch (error) {
        console.error('Failed to initialize Leaflet:', error);
        setMapError('Failed to load map libraries');
      }
    };

    initializeLeaflet();
  }, []);

  if (mapError) {
    return (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#EBE2D4',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h3 style={{ color: '#E84A33', marginBottom: '1rem' }}>Map Error</h3>
        <p>{mapError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Reload Map
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[41.5081, -81.6044]} // Centered on Mondstadt coordinates
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        maxZoom={10}
        minZoom={3}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Genshin Impact Interactive Map Demo'
          opacity={0.6}
        />
        
        <MapContent />
      </MapContainer>
      
      {/* Route Planning Mode Indicator */}
      {state.routePlanningMode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(208, 176, 131, 0.95)',
          color: '#1C264F',
          padding: '0.75rem 1.5rem',
          borderRadius: '25px',
          fontWeight: '600',
          fontSize: '0.9rem',
          zIndex: 1000,
          border: '2px solid #F2D8A8',
          boxShadow: '0 4px 15px rgba(208, 176, 131, 0.3)'
        }}>
          🗺️ Route Planning Mode - Click on map to add waypoints ({state.currentRoute.length})
        </div>
      )}
      
      {/* Version indicator */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        background: 'rgba(28, 38, 79, 0.8)',
        color: '#EBE2D4',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        zIndex: 1000,
        border: '1px solid rgba(208, 176, 131, 0.3)'
      }}>
        Map v{state.mapVersion}
      </div>
    </div>
  );
};

export default FullInteractiveMap;