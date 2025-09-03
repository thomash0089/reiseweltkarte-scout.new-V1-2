import React, { useState, useEffect } from 'react';
import { MapProvider } from './context/MapContext';

// Lazy load heavy map components
const LazyMapContainer = React.lazy(() => 
  import('./components/map/MapContainer')
);

const LazySidebar = React.lazy(() => 
  import('./components/Sidebar')
);

const LazyFloatingToolbar = React.lazy(() => 
  import('./components/FloatingToolbar')
);

function App() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <MapProvider>
      <div className="app">
        <React.Suspense fallback={
          <div className="sidebar open fade-in">
            <div className="sidebar-header">
              <h1 className="sidebar-title">Teyvat Interactive Map</h1>
            </div>
            <div className="sidebar-content">
              <p>Loading...</p>
            </div>
          </div>
        }>
          <LazySidebar 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)} 
          />
        </React.Suspense>
        
        <div className="map-container">
          <React.Suspense fallback={
            <div style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
              color: '#EBE2D4',
              fontSize: '1.2rem',
              fontFamily: 'Cinzel, serif'
            }}>
              Loading Interactive Map...
            </div>
          }>
            <LazyMapContainer />
          </React.Suspense>
        </div>
        
        <React.Suspense fallback={null}>
          <LazyFloatingToolbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </React.Suspense>
      </div>
    </MapProvider>
  );
}

export default App;
