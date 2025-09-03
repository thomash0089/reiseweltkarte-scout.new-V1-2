import React, { useState } from 'react';
import { X, Heart, Calendar, Star, Clock, DollarSign, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Destination } from '../types';

interface DestinationSidebarProps {
  destination: Destination | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (destinationId: string) => void;
  onAddToTrip: (destinationId: string) => void;
  isSaved: boolean;
}

const DestinationSidebar: React.FC<DestinationSidebarProps> = ({
  destination,
  isOpen,
  onClose,
  onSave,
  onAddToTrip,
  isSaved
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!destination) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % destination.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + destination.images.length) % destination.images.length);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attractions': return 'text-red-600 bg-red-100';
      case 'natural': return 'text-blue-600 bg-blue-100';
      case 'adventure': return 'text-green-600 bg-green-100';
      case 'hidden-gems': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriceDisplay = (price: string) => {
    switch (price) {
      case '$': return { text: 'Budget', symbol: '$' };
      case '$$': return { text: 'Moderate', symbol: '$$' };
      case '$$$': return { text: 'Luxury', symbol: '$$$' };
      default: return { text: 'Unknown', symbol: '?' };
    }
  };

  const priceInfo = getPriceDisplay(destination.price);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:relative top-0 right-0 h-full w-full md:w-96 bg-white dark:bg-gray-800 shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        md:${isOpen ? 'block' : 'hidden'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {destination.name}
              </h2>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {destination.rating}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Image Carousel */}
            <div className="relative h-64 bg-gray-200 dark:bg-gray-700">
              <img
                src={destination.images[currentImageIndex]}
                alt={destination.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                }}
              />
              
              {/* Image Navigation */}
              {destination.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {destination.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              
              {/* Category Badge */}
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
                getCategoryColor(destination.category)
              }`}>
                {destination.category === 'hidden-gems' ? 'Hidden Gems' : destination.category.charAt(0).toUpperCase() + destination.category.slice(1)}
              </div>
            </div>

            {/* Info Cards */}
            <div className="p-4 space-y-4">
              {/* Description */}
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {destination.description}
                </p>
              </div>

              {/* Essentials Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Essentials
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Best Time</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{destination.bestTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Cost ({priceInfo.text})
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{destination.cost}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Language</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{destination.language}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Activities Card */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Top Activities
                </h3>
                <ul className="space-y-2">
                  {destination.topActivities.map((activity, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nearby Spots Card */}
              {destination.nearbySpots.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Nearby Spots
                  </h3>
                  <div className="space-y-2">
                    {destination.nearbySpots.map((spot, index) => (
                      <button
                        key={index}
                        className="block w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        {spot.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <button
              onClick={() => onSave(destination.id)}
              disabled={isSaved}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                isSaved
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved to My List' : 'Save to My List'}</span>
            </button>
            
            <button
              onClick={() => onAddToTrip(destination.id)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>Add to Trip</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DestinationSidebar;