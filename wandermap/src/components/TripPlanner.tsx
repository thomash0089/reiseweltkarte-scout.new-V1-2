import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Edit3, Save, X, MapPin, Clock } from 'lucide-react';
import { TripPlan, Destination } from '../types';

interface TripPlannerProps {
  tripPlans: TripPlan[];
  destinations: Destination[];
  onUpdateTrips: (trips: TripPlan[]) => void;
}

const TripPlanner: React.FC<TripPlannerProps> = ({
  tripPlans,
  destinations,
  onUpdateTrips
}) => {
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(tripPlans[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');
  const [newTripName, setNewTripName] = useState('');
  const [showNewTripForm, setShowNewTripForm] = useState(false);

  const createNewTrip = () => {
    if (!newTripName.trim()) return;
    
    const newTrip: TripPlan = {
      id: Date.now().toString(),
      name: newTripName.trim(),
      destinations: [],
      notes: '',
      createdAt: new Date().toISOString()
    };
    
    const updatedTrips = [...tripPlans, newTrip];
    onUpdateTrips(updatedTrips);
    localStorage.setItem('wandermap-trips', JSON.stringify(updatedTrips));
    
    setSelectedTrip(newTrip);
    setNewTripName('');
    setShowNewTripForm(false);
  };

  const deleteTrip = (tripId: string) => {
    const updatedTrips = tripPlans.filter(trip => trip.id !== tripId);
    onUpdateTrips(updatedTrips);
    localStorage.setItem('wandermap-trips', JSON.stringify(updatedTrips));
    
    if (selectedTrip?.id === tripId) {
      setSelectedTrip(updatedTrips[0] || null);
    }
  };

  const removeDestinationFromTrip = (destinationId: string) => {
    if (!selectedTrip) return;
    
    const updatedTrip = {
      ...selectedTrip,
      destinations: selectedTrip.destinations.filter(id => id !== destinationId)
    };
    
    const updatedTrips = tripPlans.map(trip => 
      trip.id === selectedTrip.id ? updatedTrip : trip
    );
    
    onUpdateTrips(updatedTrips);
    localStorage.setItem('wandermap-trips', JSON.stringify(updatedTrips));
    setSelectedTrip(updatedTrip);
  };

  const saveNotes = () => {
    if (!selectedTrip) return;
    
    const updatedTrip = {
      ...selectedTrip,
      notes: editingNotes
    };
    
    const updatedTrips = tripPlans.map(trip => 
      trip.id === selectedTrip.id ? updatedTrip : trip
    );
    
    onUpdateTrips(updatedTrips);
    localStorage.setItem('wandermap-trips', JSON.stringify(updatedTrips));
    setSelectedTrip(updatedTrip);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditingNotes(selectedTrip?.notes || '');
    setIsEditing(true);
  };

  const getDestinationDetails = (destinationIds: string[]) => {
    return destinationIds
      .map(id => destinations.find(dest => dest.id === id))
      .filter(Boolean) as Destination[];
  };

  const tripDestinations = selectedTrip ? getDestinationDetails(selectedTrip.destinations) : [];

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-full flex">
        {/* Trip List Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Trip Plans
                </h2>
              </div>
              <button
                onClick={() => setShowNewTripForm(true)}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                title="Create new trip"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* New Trip Form */}
            {showNewTripForm && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Trip name"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && createNewTrip()}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={createNewTrip}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewTripForm(false);
                      setNewTripName('');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trip List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {tripPlans.length === 0 ? (
              <div className="p-4 text-center">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  No trip plans yet. Create your first trip!
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {tripPlans.map((trip) => (
                  <div
                    key={trip.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTrip?.id === trip.id
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
                    }`}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {trip.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {trip.destinations.length} destination{trip.destinations.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Created {new Date(trip.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {trip.id !== 'default' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTrip(trip.id);
                          }}
                          className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trip Details */}
        <div className="flex-1 flex flex-col">
          {selectedTrip ? (
            <>
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedTrip.name}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedTrip.destinations.length} destinations</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Created {new Date(selectedTrip.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Destinations Timeline */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Itinerary
                  </h2>
                  
                  {tripDestinations.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No destinations added yet. Start exploring and add destinations to your trip!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tripDestinations.map((destination, index) => (
                        <div key={destination.id} className="flex items-start space-x-4">
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            {index < tripDestinations.length - 1 && (
                              <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-600 mt-2" />
                            )}
                          </div>
                          
                          {/* Destination card */}
                          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                  {destination.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {destination.description}
                                </p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                                  <span>⭐ {destination.rating}/5</span>
                                  <span>{destination.price}</span>
                                  <span>{destination.bestTime}</span>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => removeDestinationFromTrip(destination.id)}
                                className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors ml-4"
                                title="Remove from trip"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notes
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={startEditing}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Add notes for your trip..."
                        className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                  focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={saveNotes}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-24">
                      {selectedTrip.notes ? (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedTrip.notes}
                        </p>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          No notes yet. Click "Edit" to add some!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No trip selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Select a trip from the sidebar or create a new one to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;