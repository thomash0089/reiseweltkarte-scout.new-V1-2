import React, { useState } from 'react';
import { useMapContext } from '../../context/MapContext';
import { RouteWaypoint } from '../../context/MapContext';
import { v4 as uuidv4 } from 'uuid';

const RoutePlanner: React.FC = () => {
  const { state, dispatch } = useMapContext();
  const [routeName, setRouteName] = useState('');
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Daily Crystal Farming', description: 'Optimal route for mining all crystal spawns' },
    { id: 2, name: 'Mondstadt Specialties', description: 'Gather all Mondstadt-specific plants' },
    { id: 3, name: 'Liyue Ore Run', description: 'High-yield ore farming in Liyue region' },
  ]);

  const toggleRoutePlanning = () => {
    dispatch({ type: 'TOGGLE_ROUTE_PLANNING' });
  };

  const clearCurrentRoute = () => {
    dispatch({ type: 'CLEAR_ROUTE' });
  };

  const saveCurrentRoute = () => {
    // In a full implementation, this would save to localStorage or backend
    console.log('Route saved:', routeName, state.currentRoute);
    
    // Mock implementation for demo
    alert(`Route "${routeName}" saved successfully!`);
    
    // Clear current route after saving
    dispatch({ type: 'CLEAR_ROUTE' });
    setRouteName('');
  };

  const loadRouteTemplate = (templateId: number) => {
    // In a full implementation, this would load predefined routes
    const template = templates.find(t => t.id === templateId);
    
    if (!template) return;
    
    // Generate sample waypoints for the selected template
    const sampleWaypoints: RouteWaypoint[] = [
      {
        id: 1,
        position: [0, 0],
        name: `${template.name} - Start`,
        description: 'Starting point'
      },
      {
        id: 2,
        position: [10, 10],
        name: `${template.name} - Checkpoint 1`,
        description: 'First resource location'
      },
      {
        id: 3,
        position: [20, 20],
        name: `${template.name} - Checkpoint 2`,
        description: 'Second resource location'
      },
      {
        id: 4,
        position: [30, 30],
        name: `${template.name} - End`,
        description: 'End point'
      }
    ];
    
    // Clear any existing route
    dispatch({ type: 'CLEAR_ROUTE' });
    
    // Add each waypoint to the route
    sampleWaypoints.forEach(waypoint => {
      dispatch({ type: 'ADD_ROUTE_WAYPOINT', waypoint });
    });
    
    // Update route name
    setRouteName(template.name);
  };

  // This function correctly includes the id property now
  const addWaypointManually = () => {
    // In a real implementation, this would grab coordinates from the map
    // For demo purposes, we'll just add a random point
    const newWaypoint: RouteWaypoint = {
      id: Math.floor(Math.random() * 1000), // Generate random ID
      position: [
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100)
      ],
      name: `Waypoint ${state.currentRoute.length + 1}`,
      description: 'Manually added waypoint'
    };
    
    dispatch({ type: 'ADD_ROUTE_WAYPOINT', waypoint: newWaypoint });
  };

  return (
    <div className="route-planner">
      <div className="form-group">
        <button 
          className={`btn ${state.routePlanningMode ? 'btn-active' : ''}`}
          onClick={toggleRoutePlanning}
        >
          {state.routePlanningMode ? 'Disable Route Planning' : 'Enable Route Planning'}
        </button>
      </div>
      
      {state.routePlanningMode && (
        <>
          <div className="form-group">
            <input 
              type="text"
              className="form-input"
              placeholder="Route Name"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            />
          </div>
          
          <div className="action-buttons">
            <button className="btn" onClick={addWaypointManually}>
              Add Waypoint
            </button>
            <button className="btn" onClick={clearCurrentRoute}>
              Clear Route
            </button>
            <button 
              className="btn" 
              onClick={saveCurrentRoute}
              disabled={state.currentRoute.length === 0 || !routeName}
            >
              Save Route
            </button>
          </div>
          
          <div className="route-stats">
            <p>Current Route: {routeName || 'Unnamed'}</p>
            <p>Waypoints: {state.currentRoute.length}</p>
          </div>
        </>
      )}
      
      <div className="templates-section">
        <h4>Route Templates</h4>
        <div className="template-list">
          {templates.map(template => (
            <div 
              key={template.id}
              className="template-item"
              onClick={() => loadRouteTemplate(template.id)}
            >
              <div className="template-name">{template.name}</div>
              <div className="template-desc">{template.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      {state.currentRoute.length > 0 && (
        <div className="current-route">
          <h4>Current Waypoints</h4>
          <div className="waypoint-list">
            {state.currentRoute.map((waypoint, index) => (
              <div key={waypoint.id} className="waypoint-item">
                <div className="waypoint-number">{index + 1}</div>
                <div className="waypoint-details">
                  <div className="waypoint-name">{waypoint.name}</div>
                  <div className="waypoint-desc">{waypoint.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;
