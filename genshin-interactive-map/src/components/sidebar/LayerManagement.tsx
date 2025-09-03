import React from 'react';
import { useMapContext } from '../../context/MapContext';

const LayerManagement: React.FC = () => {
  const { state, dispatch } = useMapContext();

  // Define a type-safe layer toggler function
  const toggleLayer = (layer: keyof typeof state.activeLayers, sublayer?: string) => {
    dispatch({ type: 'TOGGLE_LAYER', layer, sublayer });
  };

  return (
    <div className="layer-management">
      {/* Treasure Chests */}
      <div className="layer-group">
        <div className="layer-title">Treasure Chests</div>
        <div className="sublayer-list">
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="chest-common" 
              checked={state.activeLayers.treasureChests.common} 
              onChange={() => toggleLayer('treasureChests', 'common')}
            />
            <label htmlFor="chest-common">Common Chests</label>
          </div>
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="chest-exquisite" 
              checked={state.activeLayers.treasureChests.exquisite}
              onChange={() => toggleLayer('treasureChests', 'exquisite')}
            />
            <label htmlFor="chest-exquisite">Exquisite Chests</label>
          </div>
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="chest-precious" 
              checked={state.activeLayers.treasureChests.precious}
              onChange={() => toggleLayer('treasureChests', 'precious')}
            />
            <label htmlFor="chest-precious">Precious Chests</label>
          </div>
        </div>
      </div>
      
      {/* Oculi */}
      <div className="layer-group">
        <div className="layer-title">Oculi</div>
        <div className="sublayer-list">
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="oculi-anemo" 
              checked={state.activeLayers.oculi.anemoculi}
              onChange={() => toggleLayer('oculi', 'anemoculi')}
            />
            <label htmlFor="oculi-anemo">Anemoculi</label>
          </div>
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="oculi-geo" 
              checked={state.activeLayers.oculi.geoculi}
              onChange={() => toggleLayer('oculi', 'geoculi')}
            />
            <label htmlFor="oculi-geo">Geoculi</label>
          </div>
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="oculi-electro" 
              checked={state.activeLayers.oculi.electroculi}
              onChange={() => toggleLayer('oculi', 'electroculi')}
            />
            <label htmlFor="oculi-electro">Electroculi</label>
          </div>
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="oculi-dendro" 
              checked={state.activeLayers.oculi.dendroculi}
              onChange={() => toggleLayer('oculi', 'dendroculi')}
            />
            <label htmlFor="oculi-dendro">Dendroculi</label>
          </div>
        </div>
      </div>
      
      {/* Waypoints */}
      <div className="layer-group">
        <div className="layer-title">
          <input 
            type="checkbox" 
            id="waypoints" 
            checked={state.activeLayers.waypoints}
            onChange={() => toggleLayer('waypoints')}
          />
          <label htmlFor="waypoints">Teleport Waypoints</label>
        </div>
      </div>
      
      {/* Materials */}
      <div className="layer-group">
        <div className="layer-title">Materials</div>
        <div className="sublayer-list">
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="materials-plants" 
              checked={state.activeLayers.materials.plants}
              onChange={() => toggleLayer('materials', 'plants')}
            />
            <label htmlFor="materials-plants">Plants</label>
          </div>
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="materials-ores" 
              checked={state.activeLayers.materials.ores}
              onChange={() => toggleLayer('materials', 'ores')}
            />
            <label htmlFor="materials-ores">Ores</label>
          </div>
          <div className="sublayer">
            <input 
              type="checkbox" 
              id="materials-animals" 
              checked={state.activeLayers.materials.animals}
              onChange={() => toggleLayer('materials', 'animals')}
            />
            <label htmlFor="materials-animals">Animals</label>
          </div>
        </div>
      </div>
      
      {/* Custom Markers */}
      <div className="layer-group">
        <div className="layer-title">
          <input 
            type="checkbox" 
            id="custom-markers" 
            checked={state.activeLayers.customMarkers}
            onChange={() => toggleLayer('customMarkers')}
          />
          <label htmlFor="custom-markers">Custom Markers</label>
        </div>
      </div>
    </div>
  );
};

export default LayerManagement;
