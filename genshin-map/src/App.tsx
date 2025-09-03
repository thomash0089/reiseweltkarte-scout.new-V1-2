import React, { useState } from 'react';
import MapContainer from './components/MapContainer';
import Sidebar from './components/Sidebar';
import FloatingToolbar from './components/FloatingToolbar';
import './styles/app.css';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app">
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
      />
      <div className="map-wrapper">
        <MapContainer />
      </div>
      <FloatingToolbar onToggleSidebar={toggleSidebar} />
    </div>
  );
};

export default App;