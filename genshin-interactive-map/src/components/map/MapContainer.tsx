import React from 'react';

const MapContainer: React.FC = () => {
  // Lazy load the actual map component
  const ActualMap = React.lazy(() => import('./ActualMapComponent'));
  
  return (
    <React.Suspense fallback={
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#EBE2D4',
        fontSize: '1.2rem'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(208, 176, 131, 0.3)',
          borderTop: '4px solid #D0B083',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ fontFamily: 'Cinzel, serif', fontSize: '1.2rem' }}>Initializing Teyvat Map...</p>
      </div>
    }>
      <ActualMap />
    </React.Suspense>
  );
};

export default MapContainer;
