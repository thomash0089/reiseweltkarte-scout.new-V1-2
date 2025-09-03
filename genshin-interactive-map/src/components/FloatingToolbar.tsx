import React from 'react';
import { useMapContext } from '../context/MapContext';

interface FloatingToolbarProps {
  onToggleSidebar: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onToggleSidebar }) => {
  const { state, dispatch } = useMapContext();

  const handleRoutePlanning = () => {
    dispatch({ type: 'TOGGLE_ROUTE_PLANNING' });
  };

  return (
    <div className="floating-toolbar">
      <button 
        className="btn-icon"
        onClick={onToggleSidebar}
        aria-label="Toggle Menu"
        title="Menu"
      >
        📋
      </button>
      
      <button 
        className="btn-icon"
        aria-label="Search"
        title="Search"
      >
        🔍
      </button>
      
      <button 
        className={`btn-icon ${state.routePlanningMode ? 'active' : ''}`}
        onClick={handleRoutePlanning}
        aria-label="Route Planning"
        title="Route Planning"
      >
        🗺️
      </button>
      
      <button 
        className="btn-icon"
        aria-label="Add Marker"
        title="Add Custom Marker"
      >
        📍
      </button>
      
      <button 
        className="btn-icon"
        aria-label="Settings"
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
};

export default FloatingToolbar;