import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Define proper TypeScript interfaces
interface TreasureChest {
  id: number;
  position: [number, number];
  region: string;
  location: string;
  description: string;
  looted: boolean;
}

interface Oculus {
  id: number;
  position: [number, number];
  region: string;
  location: string;
  description: string;
  collected: boolean;
  element: 'anemo' | 'geo' | 'electro' | 'dendro' | 'hydro' | 'pyro' | 'cryo';
}

interface Waypoint {
  id: number;
  position: [number, number];
  region: string;
  name: string;
  unlocked: boolean;
}

interface Material {
  id: number;
  position: [number, number];
  type: string;
  region: string;
  location: string;
  quantity: number;
  respawnHours: number;
}

interface RouteWaypoint {
  id: number;
  position: [number, number];
  name: string;
  description: string;
}

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

interface MapState {
  activeLayers: {
    treasureChests: {
      common: boolean;
      exquisite: boolean;
      precious: boolean;
    };
    oculi: {
      anemoculi: boolean;
      geoculi: boolean;
      electroculi: boolean;
      dendroculi: boolean;
    };
    waypoints: boolean;
    materials: {
      plants: boolean;
      ores: boolean;
      animals: boolean;
    };
    customMarkers: boolean;
  };
  mapVersion: string;
  routePlanningMode: boolean;
  currentRoute: RouteWaypoint[];
  userProgress: {
    collectedOculi: number[];
    lootedChests: number[];
    achievementProgress: { [key: number]: number };
  };
  customMarkers: CustomMarker[];
}

type MapAction = 
  | { type: 'TOGGLE_LAYER'; layer: keyof MapState['activeLayers']; sublayer?: string }
  | { type: 'SET_MAP_VERSION'; version: string }
  | { type: 'TOGGLE_ROUTE_PLANNING' }
  | { type: 'ADD_ROUTE_WAYPOINT'; waypoint: RouteWaypoint }
  | { type: 'CLEAR_ROUTE' }
  | { type: 'SAVE_ROUTE'; route: RouteWaypoint[] }
  | { type: 'UPDATE_PROGRESS'; progressType: 'oculi' | 'chest'; id: number }
  | { type: 'ADD_CUSTOM_MARKER'; marker: CustomMarker }
  | { type: 'REMOVE_CUSTOM_MARKER'; id: string }
  | { type: 'LOAD_SAVED_STATE'; state: Partial<MapState> };

const initialState: MapState = {
  activeLayers: {
    treasureChests: {
      common: true,
      exquisite: true,
      precious: true,
    },
    oculi: {
      anemoculi: true,
      geoculi: true,
      electroculi: true,
      dendroculi: true,
    },
    waypoints: true,
    materials: {
      plants: false,
      ores: false,
      animals: false,
    },
    customMarkers: true,
  },
  mapVersion: 'current',
  routePlanningMode: false,
  currentRoute: [],
  userProgress: {
    collectedOculi: [],
    lootedChests: [],
    achievementProgress: {},
  },
  customMarkers: [],
};

// This is a type guard function
function isObjectLayer(layer: any): layer is Record<string, boolean> {
  return typeof layer === 'object' && layer !== null && !Array.isArray(layer);
}

function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'TOGGLE_LAYER':
      if (action.sublayer) {
        const layerObj = state.activeLayers[action.layer];
        if (isObjectLayer(layerObj)) {
          return {
            ...state,
            activeLayers: {
              ...state.activeLayers,
              [action.layer]: {
                ...layerObj,
                [action.sublayer]: !layerObj[action.sublayer],
              },
            },
          };
        }
      } else {
        return {
          ...state,
          activeLayers: {
            ...state.activeLayers,
            [action.layer]: !state.activeLayers[action.layer],
          },
        };
      }
      return state;
    
    case 'SET_MAP_VERSION':
      return { ...state, mapVersion: action.version };
    
    case 'TOGGLE_ROUTE_PLANNING':
      return { ...state, routePlanningMode: !state.routePlanningMode, currentRoute: [] };
    
    case 'ADD_ROUTE_WAYPOINT':
      return { ...state, currentRoute: [...state.currentRoute, action.waypoint] };
    
    case 'CLEAR_ROUTE':
      return { ...state, currentRoute: [] };
    
    case 'UPDATE_PROGRESS':
      if (action.progressType === 'oculi') {
        return {
          ...state,
          userProgress: {
            ...state.userProgress,
            collectedOculi: [...state.userProgress.collectedOculi, action.id],
          },
        };
      } else if (action.progressType === 'chest') {
        return {
          ...state,
          userProgress: {
            ...state.userProgress,
            lootedChests: [...state.userProgress.lootedChests, action.id],
          },
        };
      }
      return state;
    
    case 'ADD_CUSTOM_MARKER':
      return { ...state, customMarkers: [...state.customMarkers, action.marker] };
    
    case 'REMOVE_CUSTOM_MARKER':
      return {
        ...state,
        customMarkers: state.customMarkers.filter(marker => marker.id !== action.id),
      };
    
    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.state };
    
    default:
      return state;
  }
}

interface MapContextValue {
  state: MapState;
  dispatch: React.Dispatch<MapAction>;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const MapContext = createContext<MapContextValue | undefined>(undefined);

interface MapProviderProps {
  children: ReactNode;
}

export function MapProvider({ children }: MapProviderProps) {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  // Save to localStorage
  const saveToLocalStorage = () => {
    try {
      const dataToSave = {
        activeLayers: state.activeLayers,
        mapVersion: state.mapVersion,
        userProgress: state.userProgress,
        customMarkers: state.customMarkers,
      };
      localStorage.setItem('genshinMapState', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('genshinMapState');
      if (saved) {
        const parsedState = JSON.parse(saved);
        dispatch({ type: 'LOAD_SAVED_STATE', state: parsedState });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  };

  // Load state on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Save state on changes
  useEffect(() => {
    saveToLocalStorage();
  }, [state]);

  const contextValue: MapContextValue = {
    state,
    dispatch,
    saveToLocalStorage,
    loadFromLocalStorage,
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}

// Export types for use in other components
export type { 
  TreasureChest, 
  Oculus, 
  Waypoint, 
  Material, 
  RouteWaypoint, 
  CustomMarker, 
  MapState,
  MapAction
};
