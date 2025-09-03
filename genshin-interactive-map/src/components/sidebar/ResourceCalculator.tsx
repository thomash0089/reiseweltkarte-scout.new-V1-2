import React, { useState, useEffect } from 'react';

interface Material {
  name: string;
  needed: number;
  collected: number;
  locations: Array<{
    region: string;
    location: string;
    quantity: number;
    respawnHours: number;
  }>;
}

const ResourceCalculator: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', needed: 0 });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load saved materials from localStorage
    const saved = localStorage.getItem('resourceCalculator');
    if (saved) {
      try {
        setMaterials(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved materials:', error);
      }
    } else {
      // Initialize with some common materials
      const defaultMaterials: Material[] = [
        {
          name: 'Violetgrass',
          needed: 168,
          collected: 45,
          locations: [
            { region: 'Liyue', location: 'Qingce Village Cliffs', quantity: 8, respawnHours: 48 },
            { region: 'Liyue', location: 'Mt. Tianheng', quantity: 6, respawnHours: 48 }
          ]
        },
        {
          name: 'Silk Flower',
          needed: 168,
          collected: 23,
          locations: [
            { region: 'Liyue', location: 'Wangshu Inn', quantity: 5, respawnHours: 48 },
            { region: 'Liyue', location: 'Liyue Harbor', quantity: 7, respawnHours: 48 }
          ]
        }
      ];
      setMaterials(defaultMaterials);
    }
  }, []);

  useEffect(() => {
    // Save materials to localStorage whenever they change
    localStorage.setItem('resourceCalculator', JSON.stringify(materials));
  }, [materials]);

  const addMaterial = () => {
    if (!newMaterial.name.trim() || newMaterial.needed <= 0) return;
    
    const material: Material = {
      name: newMaterial.name,
      needed: newMaterial.needed,
      collected: 0,
      locations: [] // Would be populated from game data
    };
    
    setMaterials(prev => [...prev, material]);
    setNewMaterial({ name: '', needed: 0 });
    setShowAddForm(false);
  };

  const updateCollected = (index: number, collected: number) => {
    setMaterials(prev => prev.map((material, i) => 
      i === index ? { ...material, collected: Math.max(0, Math.min(collected, material.needed)) } : material
    ));
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const calculateProgress = (material: Material) => {
    return Math.round((material.collected / material.needed) * 100);
  };

  const calculateDaysNeeded = (material: Material) => {
    if (material.collected >= material.needed) return 0;
    const remaining = material.needed - material.collected;
    const dailyYield = material.locations.reduce((total, loc) => total + loc.quantity, 0);
    if (dailyYield === 0) return 0;
    return Math.ceil(remaining / dailyYield);
  };

  return (
    <div className="resource-calculator">
      <div className="calculator-header">
        <h4>📋 Resource Calculator</h4>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          Add Material
        </button>
      </div>

      {/* Add Material Form */}
      {showAddForm && (
        <div className="add-material-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Material name..."
              className="form-input"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div className="form-group">
            <input
              type="number"
              placeholder="Amount needed"
              className="form-input"
              value={newMaterial.needed || ''}
              onChange={(e) => setNewMaterial(prev => ({ ...prev, needed: parseInt(e.target.value) || 0 }))}
            />
          </div>
          
          <div className="button-group">
            <button className="btn btn-primary" onClick={addMaterial}>
              Add
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Materials List */}
      <div className="materials-list">
        {materials.length === 0 ? (
          <p className="empty-state">No materials tracked yet. Add your first material to get started!</p>
        ) : (
          materials.map((material, index) => {
            const progress = calculateProgress(material);
            const daysNeeded = calculateDaysNeeded(material);
            
            return (
              <div key={index} className="material-item">
                <div className="material-header">
                  <h5>{material.name}</h5>
                  <button 
                    className="btn-icon delete-material"
                    onClick={() => removeMaterial(index)}
                    title="Remove material"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="material-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {material.collected} / {material.needed} ({progress}%)
                  </span>
                </div>
                
                <div className="material-controls">
                  <button 
                    className="btn-icon"
                    onClick={() => updateCollected(index, material.collected - 1)}
                    disabled={material.collected <= 0}
                  >
                    -
                  </button>
                  
                  <input
                    type="number"
                    className="quantity-input"
                    value={material.collected}
                    onChange={(e) => updateCollected(index, parseInt(e.target.value) || 0)}
                    min="0"
                    max={material.needed}
                  />
                  
                  <button 
                    className="btn-icon"
                    onClick={() => updateCollected(index, material.collected + 1)}
                    disabled={material.collected >= material.needed}
                  >
                    +
                  </button>
                </div>
                
                {daysNeeded > 0 && (
                  <div className="material-estimate">
                    <span className="days-needed">
                      🗺 {daysNeeded} days remaining
                    </span>
                  </div>
                )}
                
                {material.locations.length > 0 && (
                  <div className="material-locations">
                    <h6>Best Locations:</h6>
                    {material.locations.map((location, locIndex) => (
                      <div key={locIndex} className="location-item">
                        <span className="location-name">
                          {location.location}, {location.region}
                        </span>
                        <span className="location-yield">
                          ~{location.quantity} ({location.respawnHours}h)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary Statistics */}
      {materials.length > 0 && (
        <div className="calculator-summary">
          <h5>Summary</h5>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Materials:</span>
              <span className="stat-value">{materials.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">
                {materials.filter(m => m.collected >= m.needed).length}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Overall Progress:</span>
              <span className="stat-value">
                {Math.round(
                  (materials.reduce((sum, m) => sum + m.collected, 0) / 
                   materials.reduce((sum, m) => sum + m.needed, 0)) * 100
                )}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceCalculator;