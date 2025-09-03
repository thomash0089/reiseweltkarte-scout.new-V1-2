import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Moon, Sun, User, Menu, X, Compass } from 'lucide-react';

interface HeaderProps {
  activeTab: 'explore' | 'saved' | 'planner';
  onTabChange: (tab: 'explore' | 'saved' | 'planner') => void;
  onSearch: (query: string) => void;
  onToggleFilter: () => void;
  onToggleDarkMode: () => void;
  onAuthClick: () => void;
  searchQuery: string;
  darkMode: boolean;
  user: any;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onSearch,
  onToggleFilter,
  onToggleDarkMode,
  onAuthClick,
  searchQuery,
  darkMode,
  user
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: 'explore' as const, label: 'Explore Map', icon: '🗺️' },
    { id: 'saved' as const, label: 'Saved Destinations', icon: '❤️' },
    { id: 'planner' as const, label: 'Trip Planner', icon: '📅' }
  ];

  const handleSearchInput = (value: string) => {
    onSearch(value);
    
    // Simple autocomplete simulation
    if (value.length > 1) {
      const suggestions = [
        'Paris, France',
        'Tokyo, Japan', 
        'New York, USA',
        'London, UK',
        'Sydney, Australia',
        'Barcelona, Spain',
        'Rome, Italy',
        'Bangkok, Thailand'
      ].filter(place => place.toLowerCase().includes(value.toLowerCase()));
      setAutocompleteResults(suggestions.slice(0, 5));
    } else {
      setAutocompleteResults([]);
    }
  };

  const handleAutocompleteSelect = (suggestion: string) => {
    onSearch(suggestion);
    setAutocompleteResults([]);
    setIsSearchFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setAutocompleteResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Compass className="w-8 h-8 text-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-blue-600 w-4 h-4 rounded-full top-2 left-2 opacity-70"></div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                WanderMap
              </h1>
            </div>
          </div>

          {/* Navigation Tabs - Desktop */}
          <nav className="hidden md:flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          placeholder-gray-500 dark:placeholder-gray-400
                          transition-all duration-200"
              />
            </div>
            
            {/* Autocomplete Dropdown */}
            {isSearchFocused && autocompleteResults.length > 0 && (
              <div className="search-autocomplete">
                {autocompleteResults.map((suggestion, index) => (
                  <div
                    key={index}
                    className="autocomplete-item text-gray-900 dark:text-white"
                    onClick={() => handleAutocompleteSelect(suggestion)}
                  >
                    <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Filter Button */}
            <button
              onClick={onToggleFilter}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle Filters"
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User/Login Button */}
            <button
              onClick={onAuthClick}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user ? user.username : 'Login'}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;