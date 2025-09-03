import React, { useState } from 'react';
import '../styles/sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const [expandedSections, setExpandedSections] = useState({
    layers: true,
    routes: false,
    markers: false,
    tools: false,
  });

  // Toggle sections expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle layer visibility (placeholder function)
  const toggleLayer = (layer: string, sublayer?: string) => {
    console.log(`Toggling ${sublayer ? `${layer}.${sublayer}` : layer}`);
    // In a real implementation, this would dispatch an action to a context
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          {isOpen ? 'Teyvat Interactive Map' : 'TIM'}
        </h1>
        <button 
          className="toggle-button"
          onClick={onToggle}
          aria-label="Toggle Sidebar"
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      {isOpen && (
        <div className="sidebar-content">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search locations, items..."
              className="search-input"
            />
          </div>

          {/* Map Version Selector */}
          <div className="form-group">
            <label className="form-label">Map Version</label>
            <select className="form-select">
              <option value="current">Current (v4.2)</option>
              <option value="4.1">Version 4.1</option>
              <option value="4.0">Version 4.0</option>
              <option value="3.8">Version 3.8</option>
            </select>
          </div>

          {/* Layer Management */}
          <div className="collapsible-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('layers')}
            >
              <h3 className="section-title">Layer Management</h3>
              <span className="toggle-icon">{expandedSections.layers ? '▼' : '▶'}</span>
            </div>
            <div className={`section-content ${expandedSections.layers ? 'expanded' : ''}`}>
              {/* Treasure Chests */}
              <div className="layer-group">
                <div className="layer-parent">
                  <span className="layer-label">📦 Treasure Chests</span>
                </div>
                
                <div className="sublayer-group">
                  <div className="toggle-switch" onClick={() => toggleLayer('treasureChests', 'common')}>
                    <span className="toggle-label">Common Chests</span>
                    <div className="toggle-control"></div>
                  </div>
                  
                  <div className="toggle-switch" onClick={() => toggleLayer('treasureChests', 'exquisite')}>
                    <span className="toggle-label">Exquisite Chests</span>
                    <div className="toggle-control"></div>
                  </div>
                  
                  <div className="toggle-switch" onClick={() => toggleLayer('treasureChests', 'precious')}>
                    <span className="toggle-label">Precious Chests</span>
                    <div className="toggle-control"></div>
                  </div>
                </div>
              </div>

              {/* Oculi */}
              <div className="layer-group">
                <div className="layer-parent">
                  <span className="layer-label">✨ Oculi</span>
                </div>
                
                <div className="sublayer-group">
                  <div className="toggle-switch" onClick={() => toggleLayer('oculi', 'anemoculi')}>
                    <span className="toggle-label">💨 Anemoculi</span>
                    <div className="toggle-control"></div>
                  </div>
                  
                  <div className="toggle-switch" onClick={() => toggleLayer('oculi', 'geoculi')}>
                    <span className="toggle-label">🗿 Geoculi</span>
                    <div className="toggle-control"></div>
                  </div>
                  
                  <div className="toggle-switch" onClick={() => toggleLayer('oculi', 'electroculi')}>
                    <span className="toggle-label">⚡ Electroculi</span>
                    <div className="toggle-control"></div>
                  </div>
                  
                  <div className="toggle-switch" onClick={() => toggleLayer('oculi', 'dendroculi')}>
                    <span className="toggle-label">🌱 Dendroculi</span>
                    <div className="toggle-control"></div>
                  </div>
                </div>
              </div>

              {/* Waypoints */}
              <div className="layer-group">
                <div className="toggle-switch" onClick={() => toggleLayer('waypoints')}>
                  <span className="toggle-label">🌀 Waypoints & Statues</span>
                  <div className="toggle-control"></div>
                </div>
              </div>

              {/* Materials */}
              <div className="layer-group">
                <div className="layer-parent">
                  <span className="layer-label">🌿 Materials</span>
                </div>
                
                <div className="sublayer-group">
                  <div className="toggle-switch" onClick={() => toggleLayer('materials', 'plants')}>
                    <span className="toggle-label">Plants</span>
                    <div className="toggle-control"></div>
                  </div>
                  
                  <div className="toggle-switch" onClick={() => toggleLayer('materials', 'ores')}>
                    <span className="toggle-label">Ores & Mining</span>
                    <div className="toggle-control"></div>
                  </div>
                  
                  <div className="toggle-switch" onClick={() => toggleLayer('materials', 'animals')}>
                    <span className="toggle-label">Animals & Drops</span>
                    <div className="toggle-control"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Route Planner */}
          <div className="collapsible-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('routes')}
            >
              <h3 className="section-title">Route Planner</h3>
              <span className="toggle-icon">{expandedSections.routes ? '▼' : '▶'}</span>
            </div>
            <div className={`section-content ${expandedSections.routes ? 'expanded' : ''}`}>
              <div className="route-planning">
                <button className="btn btn-primary full-width">Start Route Planning</button>
                <p className="help-text">
                  Click on the map to add waypoints to your route.
                </p>

                <div className="saved-routes">
                  <h4 className="subsection-title">Saved Routes</h4>
                  <div className="empty-state">
                    No saved routes yet. Plan your first route to optimize your farming!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Markers */}
          <div className="collapsible-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('markers')}
            >
              <h3 className="section-title">Custom Markers</h3>
              <span className="toggle-icon">{expandedSections.markers ? '▼' : '▶'}</span>
            </div>
            <div className={`section-content ${expandedSections.markers ? 'expanded' : ''}`}>
              <button className="btn btn-primary full-width">Add New Marker</button>
              <div className="markers-list">
                <h4 className="subsection-title">My Markers (0)</h4>
                <div className="empty-state">
                  No custom markers yet. Add your first marker to get started!
                </div>
              </div>
            </div>
          </div>

          {/* Tools & Trackers */}
          <div className="collapsible-section">
            <div 
              className="section-header"
              onClick={() => toggleSection('tools')}
            >
              <h3 className="section-title">Tools & Trackers</h3>
              <span className="toggle-icon">{expandedSections.tools ? '▼' : '▶'}</span>
            </div>
            <div className={`section-content ${expandedSections.tools ? 'expanded' : ''}`}>
              <div className="tools-list">
                <div className="tool-item">
                  <h4 className="tool-title">Resource Calculator</h4>
                  <p className="tool-description">
                    Calculate how many days you need to farm for character ascension materials.
                  </p>
                  <button className="btn btn-secondary">Open Calculator</button>
                </div>
                
                <div className="tool-item">
                  <h4 className="tool-title">Achievement Tracker</h4>
                  <p className="tool-description">
                    Track your progress on achievements across Teyvat.
                  </p>
                  <button className="btn btn-secondary">Open Tracker</button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sidebar-footer">
            <p className="version-info">Genshin Interactive Map v1.0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;