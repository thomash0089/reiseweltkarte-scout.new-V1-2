import React, { useState } from 'react';
import { useMapContext } from '../context/MapContext';
import LayerManagement from './sidebar/LayerManagement';
import RoutePlanner from './sidebar/RoutePlanner';
import CustomMarkers from './sidebar/CustomMarkers';
import ResourceCalculator from './sidebar/ResourceCalculator';
import AchievementTracker from './sidebar/AchievementTracker';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { state, dispatch } = useMapContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    layers: true,
    routes: false,
    markers: false,
    tools: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : 'collapsed'} fade-in`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            {isOpen ? 'Teyvat Interactive Map' : 'TIM'}
          </h1>
          <button 
            className="btn-icon"
            onClick={onToggle}
            aria-label="Toggle Sidebar"
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>

        {isOpen && (
          <div className="sidebar-content">
            {/* Search Bar */}
            <div className="form-group">
              <input
                type="text"
                placeholder="Search locations, materials..."
                className="form-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Map Version Selector */}
            <div className="form-group">
              <label className="form-label">Map Version</label>
              <select 
                className="form-input"
                value={state.mapVersion}
                onChange={(e) => dispatch({ type: 'SET_MAP_VERSION', version: e.target.value })}
              >
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
                <span>{expandedSections.layers ? '▼' : '▶'}</span>
              </div>
              <div className={`section-content ${expandedSections.layers ? 'expanded' : ''}`}>
                <LayerManagement />
              </div>
            </div>

            {/* Route Planner */}
            <div className="collapsible-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('routes')}
              >
                <h3 className="section-title">Route Planner</h3>
                <span>{expandedSections.routes ? '▼' : '▶'}</span>
              </div>
              <div className={`section-content ${expandedSections.routes ? 'expanded' : ''}`}>
                <RoutePlanner />
              </div>
            </div>

            {/* Custom Markers */}
            <div className="collapsible-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('markers')}
              >
                <h3 className="section-title">Custom Markers</h3>
                <span>{expandedSections.markers ? '▼' : '▶'}</span>
              </div>
              <div className={`section-content ${expandedSections.markers ? 'expanded' : ''}`}>
                <CustomMarkers />
              </div>
            </div>

            {/* Auxiliary Tools */}
            <div className="collapsible-section">
              <div 
                className="section-header"
                onClick={() => toggleSection('tools')}
              >
                <h3 className="section-title">Tools & Trackers</h3>
                <span>{expandedSections.tools ? '▼' : '▶'}</span>
              </div>
              <div className={`section-content ${expandedSections.tools ? 'expanded' : ''}`}>
                <ResourceCalculator />
                <AchievementTracker />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;