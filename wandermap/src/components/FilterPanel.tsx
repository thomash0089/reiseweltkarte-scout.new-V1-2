import React from 'react';
import { X, MapPin, DollarSign, Star } from 'lucide-react';
import { FilterState } from '../types';

interface FilterPanelProps {
  isOpen: boolean;
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  filters,
  onFilterChange,
  onClose
}) => {
  const categories = [
    { id: 'attractions', label: 'Attractions', icon: '🏠', color: 'text-red-600' },
    { id: 'natural', label: 'Natural Sites', icon: '🌲', color: 'text-blue-600' },
    { id: 'adventure', label: 'Adventure', icon: '🏄', color: 'text-green-600' },
    { id: 'hidden-gems', label: 'Hidden Gems', icon: '🔍', color: 'text-purple-600' }
  ];

  const priceRanges = [
    { id: '$', label: 'Budget ($)', description: 'Under $75/day' },
    { id: '$$', label: 'Moderate ($$)', description: '$75-150/day' },
    { id: '$$$', label: 'Luxury ($$$)', description: 'Over $150/day' }
  ];

  const ratingOptions = [
    { value: 3, label: '3+ Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 4.5, label: '4.5+ Stars' }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ categories: newCategories });
  };

  const handlePriceToggle = (priceId: string) => {
    const newPriceRange = filters.priceRange.includes(priceId)
      ? filters.priceRange.filter(id => id !== priceId)
      : [...filters.priceRange, priceId];
    onFilterChange({ priceRange: newPriceRange });
  };

  const handleRatingToggle = (rating: number) => {
    const newRatings = filters.ratings.includes(rating)
      ? filters.ratings.filter(r => r !== rating)
      : [...filters.ratings, rating];
    onFilterChange({ ratings: newRatings });
  };

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      priceRange: [],
      ratings: [],
      searchQuery: ''
    });
  };

  const activeFiltersCount = filters.categories.length + filters.priceRange.length + filters.ratings.length;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Filter Panel */}
      <div className={`
        fixed md:relative top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isOpen ? 'md:block' : 'md:hidden'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer
                              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                      filters.categories.includes(category.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {filters.categories.includes(category.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="mr-2 text-lg">{category.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Price Range
              </h3>
              <div className="space-y-2">
                {priceRanges.map((price) => (
                  <label
                    key={price.id}
                    className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer
                              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.priceRange.includes(price.id)}
                      onChange={() => handlePriceToggle(price.id)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                      filters.priceRange.includes(price.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {filters.priceRange.includes(price.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {price.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {price.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Rating
              </h3>
              <div className="space-y-2">
                {ratingOptions.map((rating) => (
                  <label
                    key={rating.value}
                    className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer
                              hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.ratings.includes(rating.value)}
                      onChange={() => handleRatingToggle(rating.value)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                      filters.ratings.includes(rating.value)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300 dark:border-gray-500'
                    }`}>
                      {filters.ratings.includes(rating.value) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.value
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        {rating.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;