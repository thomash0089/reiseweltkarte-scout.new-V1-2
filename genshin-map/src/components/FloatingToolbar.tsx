import React from 'react';
import '../styles/floatingToolbar.css';

interface FloatingToolbarProps {
  onToggleSidebar: () => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ onToggleSidebar }) => {
  return (
    <div className="floating-toolbar">
      <button 
        className="toolbar-button"
        onClick={onToggleSidebar}
        aria-label="Toggle Menu"
        title="Menu"
      >
        📋
      </button>
      
      <button 
        className="toolbar-button"
        aria-label="Search"
        title="Search"
      >
        🔍
      </button>
      
      <button 
        className="toolbar-button"
        aria-label="Route Planning"
        title="Route Planning"
      >
        🗺️
      </button>
      
      <button 
        className="toolbar-button"
        aria-label="Add Marker"
        title="Add Custom Marker"
      >
        📍
      </button>
      
      <button 
        className="toolbar-button"
        aria-label="Settings"
        title="Settings"
      >
        ⚙️
      </button>
    </div>
  );
};

export default FloatingToolbar;