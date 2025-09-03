import React, { useState } from 'react';
import { useMapContext } from '../../context/MapContext';
import { v4 as uuidv4 } from 'uuid';

interface CustomMarker {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  icon: string;
  isPublic: boolean;
  author: string;
  dateCreated: string;
  rating: number;
}

const CustomMarkers: React.FC = () => {
  const { state, dispatch } = useMapContext();
  const [showAddMarker, setShowAddMarker] = useState(false);
  const [newMarker, setNewMarker] = useState({
    title: '',
    description: '',
    icon: 'pin',
    isPublic: false
  });

  const handleAddMarker = () => {
    if (!newMarker.title.trim()) return;

    const marker: CustomMarker = {
      id: uuidv4(),
      position: [41.5081, -81.6044], // Default position - in real implementation, would be set by map click
      title: newMarker.title,
      description: newMarker.description,
      icon: newMarker.icon,
      isPublic: newMarker.isPublic,
      author: 'Traveler', // Simulated user name
      dateCreated: new Date().toISOString(),
      rating: 0
    };

    dispatch({ type: 'ADD_CUSTOM_MARKER', marker });
    setNewMarker({ title: '', description: '', icon: 'pin', isPublic: false });
    setShowAddMarker(false);
  };

  const handleRemoveMarker = (id: string) => {
    dispatch({ type: 'REMOVE_CUSTOM_MARKER', id });
  };

  const iconOptions = [
    { value: 'pin', label: '📍 Pin', icon: '📍' },
    { value: 'star', label: '⭐ Star', icon: '⭐' },
    { value: 'warning', label: '⚠️ Warning', icon: '⚠️' },
    { value: 'info', label: 'ℹ️ Info', icon: 'ℹ️' },
    { value: 'treasure', label: '💎 Treasure', icon: '💎' },
    { value: 'camp', label: '🏥 Camp', icon: '🏥' }
  ];

  return (
    <div className="custom-markers">
      {/* Add Marker Button */}
      <button 
        className="btn btn-primary full-width"
        onClick={() => setShowAddMarker(!showAddMarker)}
      >
        Add New Marker
      </button>

      {/* Add Marker Form */}
      {showAddMarker && (
        <div className="add-marker-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={newMarker.title}
              onChange={(e) => setNewMarker(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Marker title..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows={3}
              value={newMarker.description}
              onChange={(e) => setNewMarker(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Icon</label>
            <select 
              className="form-input"
              value={newMarker.icon}
              onChange={(e) => setNewMarker(prev => ({ ...prev, icon: e.target.value }))}
            >
              {iconOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <div className="toggle-switch" onClick={() => setNewMarker(prev => ({ ...prev, isPublic: !prev.isPublic }))}>
              <span className="toggle-label">Make Public</span>
              <div className={`toggle-control ${newMarker.isPublic ? 'active' : ''}`}></div>
            </div>
          </div>
          
          <div className="button-group">
            <button className="btn btn-primary" onClick={handleAddMarker}>
              Add Marker
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddMarker(false)}>
              Cancel
            </button>
          </div>
          
          <p className="help-text">
            Click on the map after clicking "Add Marker" to place it.
          </p>
        </div>
      )}

      {/* Existing Markers List */}
      <div className="markers-list">
        <h4 className="list-title">My Markers ({state.customMarkers.length})</h4>
        
        {state.customMarkers.length === 0 ? (
          <p className="empty-state">No custom markers yet. Add your first marker to get started!</p>
        ) : (
          state.customMarkers.map((marker: CustomMarker) => (
            <div key={marker.id} className="marker-item">
              <div className="marker-icon">
                {iconOptions.find(opt => opt.value === marker.icon)?.icon || '📍'}
              </div>
              
              <div className="marker-info">
                <h5>{marker.title}</h5>
                {marker.description && <p>{marker.description}</p>}
                <div className="marker-meta">
                  <span className="marker-author">By {marker.author}</span>
                  <span className="marker-visibility">
                    {marker.isPublic ? '🌍 Public' : '🔒 Private'}
                  </span>
                </div>
              </div>
              
              <button 
                className="btn-icon delete-marker"
                onClick={() => handleRemoveMarker(marker.id)}
                title="Remove marker"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Community Markers (Simulated) */}
      <div className="community-markers">
        <h4 className="list-title">Community Highlights</h4>
        
        <div className="marker-item community">
          <div className="marker-icon">⭐</div>
          <div className="marker-info">
            <h5>Hidden Chest Location</h5>
            <p>Secret chest behind waterfall in Mondstadt</p>
            <div className="marker-meta">
              <span className="marker-author">By Adventurer_123</span>
              <span className="marker-rating">⭐ 4.8 (127 ratings)</span>
            </div>
          </div>
        </div>
        
        <div className="marker-item community">
          <div className="marker-icon">💎</div>
          <div className="marker-info">
            <h5>Best Mining Spot</h5>
            <p>Crystal Chunk respawn point - high yield</p>
            <div className="marker-meta">
              <span className="marker-author">By MinerMaster</span>
              <span className="marker-rating">⭐ 4.6 (89 ratings)</span>
            </div>
          </div>
        </div>
        
        <div className="marker-item community">
          <div className="marker-icon">🏥</div>
          <div className="marker-info">
            <h5>Great Photo Spot</h5>
            <p>Perfect view of Liyue Harbor at sunset</p>
            <div className="marker-meta">
              <span className="marker-author">By PhotoTraveler</span>
              <span className="marker-rating">⭐ 4.9 (203 ratings)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomMarkers;