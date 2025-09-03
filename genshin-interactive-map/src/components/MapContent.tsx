import React, { useEffect, useState, useRef } from 'react';
import { useMapContext, RouteWaypoint } from '../context/MapContext';

// Simplified MapContent component - we use the one in map/ directory now
const MapContent: React.FC = () => {
  const { state, dispatch } = useMapContext();
  
  // Initialize map when component mounts
  useEffect(() => {
    // Mock map initialization
    console.log('Map initialized');
    
    // Listen for map clicks if route planning is enabled
    if (state.routePlanningMode) {
      const handleMapClick = (e: { latlng: { lat: number, lng: number } }) => {
        const waypoint: RouteWaypoint = {
          id: Date.now(),
          position: [e.latlng.lat, e.latlng.lng] as [number, number],
          name: `Waypoint ${state.currentRoute.length + 1}`,
          description: 'Custom waypoint'
        };
        dispatch({ type: 'ADD_ROUTE_WAYPOINT', waypoint });
      };
      
      console.log('Added map click handler');
      return () => {
        console.log('Removed map click handler');
      };
    }
  }, [state.routePlanningMode, dispatch, state.currentRoute.length]);
  
  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f0f0' }}>
      Map Content is now loaded from the map/ directory
    </div>
  );
};

export default MapContent;
