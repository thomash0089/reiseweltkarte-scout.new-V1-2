import React, { useState } from 'react';
import { Heart, Trash2, Star, MapPin, Filter } from 'lucide-react';
import { Destination, SavedDestination } from '../types';

interface SavedDestinationsProps {
  savedDestinations: SavedDestination[];
  destinations: Destination[];
  onRemove: (destinationId: string) => void;
  onSelect: (destination: Destination) => void;
}

const SavedDestinations: React.FC<SavedDestinationsProps> = ({
  savedDestinations,
  destinations,
  onRemove,
  onSelect
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'saved'>('saved');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get destination details for saved items
  const savedWithDetails = savedDestinations
    .map(saved => {
      const destination = destinations.find(dest => dest.id === saved.id);
      return destination ? { ...destination, savedAt: saved.savedAt } : null;
    })
    .filter(Boolean) as (Destination & { savedAt: string })[];

  // Apply filters
  let filteredDestinations = savedWithDetails;
  if (filterCategory !== 'all') {
    filteredDestinations = savedWithDetails.filter(dest => dest.category === filterCategory);
  }

  // Apply sorting
  filteredDestinations.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'saved':
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(savedWithDetails.map(dest => dest.category)));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attractions': return 'text-red-600';
      case 'natural': return 'text-blue-600';
      case 'adventure': return 'text-green-600';
      case 'hidden-gems': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatSavedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-red-600 fill-current" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Saved Destinations
              </h1>
              <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full text-sm font-medium">
                {savedDestinations.length}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="saved">Recently Saved</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'hidden-gems' ? 'Hidden Gems' : 
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {filteredDestinations.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {savedDestinations.length === 0 ? 'No saved destinations yet' : 'No destinations match your filters'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {savedDestinations.length === 0 
                  ? 'Start exploring and save your favorite destinations to see them here!'
                  : 'Try adjusting your filters to see more destinations.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDestinations.map((destination) => (
                <div
                  key={destination.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                  onClick={() => onSelect(destination)}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={destination.images[0]}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(destination.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md
                                hover:bg-red-50 dark:hover:bg-red-900 transition-colors group"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-red-600" />
                    </button>

                    {/* Category Badge */}
                    <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-medium
                                    bg-white dark:bg-gray-800 ${getCategoryColor(destination.category)}`}>
                      {destination.category === 'hidden-gems' ? 'Hidden Gem' : 
                       destination.category.charAt(0).toUpperCase() + destination.category.slice(1)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {destination.name}
                      </h3>
                      <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {destination.rating}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {destination.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Saved {formatSavedDate(destination.savedAt)}</span>
                      <span className="font-medium">{destination.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedDestinations;