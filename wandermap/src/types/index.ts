export interface Destination {
  id: string;
  name: string;
  description: string;
  category: 'attractions' | 'natural' | 'adventure' | 'hidden-gems';
  coordinates: [number, number];
  rating: number;
  price: '$' | '$$' | '$$$';
  images: string[];
  bestTime: string;
  cost: string;
  language: string;
  topActivities: string[];
  nearbySpots: string[];
}

export interface MapPosition {
  lat: number;
  lng: number;
  zoom: number;
}

export interface FilterState {
  categories: string[];
  priceRange: string[];
  ratings: number[];
  searchQuery: string;
}

export interface SavedDestination {
  id: string;
  savedAt: string;
}

export interface TripPlan {
  id: string;
  name: string;
  destinations: string[];
  notes: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}