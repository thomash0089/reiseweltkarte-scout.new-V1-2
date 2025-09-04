import React, { useState, useEffect } from 'react';
import { Destination, FilterState, SavedDestination, TripPlan } from './types';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import FilterPanel from './components/FilterPanel';
import DestinationSidebar from './components/DestinationSidebar';
import SavedDestinations from './components/SavedDestinations';
import TripPlanner from './components/TripPlanner';
import AuthModal from './components/AuthModal';
import SeasonSelector, { SeasonSelection } from './components/SeasonSelector';
import ActivitySelector, { ActivityType } from './components/ActivitySelector';
import { debounce } from 'lodash';
import './App.css';

function App() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'saved' | 'planner'>('explore');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [seasonMonths, setSeasonMonths] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('wm-season-months')||'[]'); } catch { return []; }
  });
  const [activity, setActivity] = useState<ActivityType>(() => {
    return (localStorage.getItem('wm-activity') as ActivityType) || 'city';
  });
  const [mapLabelLanguage, setMapLabelLanguage] = useState<'en' | 'de' | 'local'>(() => {
    const saved = localStorage.getItem('wandermap-label-language');
    return saved === 'de' || saved === 'local' || saved === 'en' ? (saved as 'en' | 'de' | 'local') : 'en';
  });
  
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [],
    ratings: [],
    searchQuery: ''
  });

  // Load destinations data
  useEffect(() => {
    fetch('/data/destinations.json')
      .then(response => response.json())
      .then(data => {
        setDestinations(data.destinations);
        setFilteredDestinations(data.destinations);
      })
      .catch(error => console.error('Error loading destinations:', error));
  }, []);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wandermap-saved');
    if (saved) {
      setSavedDestinations(JSON.parse(saved));
    }
    
    const trips = localStorage.getItem('wandermap-trips');
    if (trips) {
      setTripPlans(JSON.parse(trips));
    }
    
    const theme = localStorage.getItem('wandermap-theme');
    if (theme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Persist map label language
  useEffect(() => {
    localStorage.setItem('wandermap-label-language', mapLabelLanguage);
  }, [mapLabelLanguage]);

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => debounce((query: string, currentFilters: FilterState) => {
      applyFilters({ ...currentFilters, searchQuery: query });
    }, 300),
    [destinations]
  );

  // Apply filters to destinations
  const applyFilters = (newFilters: FilterState) => {
    let filtered = [...destinations];

    // Search query filter
    if (newFilters.searchQuery) {
      const query = newFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(query) ||
        dest.description.toLowerCase().includes(query) ||
        dest.topActivities.some(activity => activity.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (newFilters.categories.length > 0) {
      filtered = filtered.filter(dest => 
        newFilters.categories.includes(dest.category)
      );
    }

    // Price filter
    if (newFilters.priceRange.length > 0) {
      filtered = filtered.filter(dest => 
        newFilters.priceRange.includes(dest.price)
      );
    }

    // Rating filter
    if (newFilters.ratings.length > 0) {
      filtered = filtered.filter(dest => {
        return newFilters.ratings.some(rating => dest.rating >= rating);
      });
    }

    setFilteredDestinations(filtered);
  };

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    debouncedSearch(query, newFilters);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    applyFilters(updatedFilters);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('wandermap-theme', !darkMode ? 'dark' : 'light');
  };

  const saveDestination = (destinationId: string) => {
    const newSaved = [...savedDestinations, {
      id: destinationId,
      savedAt: new Date().toISOString()
    }];
    setSavedDestinations(newSaved);
    localStorage.setItem('wandermap-saved', JSON.stringify(newSaved));
  };

  const removeSavedDestination = (destinationId: string) => {
    const filtered = savedDestinations.filter(saved => saved.id !== destinationId);
    setSavedDestinations(filtered);
    localStorage.setItem('wandermap-saved', JSON.stringify(filtered));
  };

  const addToTrip = (destinationId: string) => {
    // Simple implementation - add to default trip
    const defaultTrip = tripPlans.find(trip => trip.name === 'My Trip') || {
      id: 'default',
      name: 'My Trip',
      destinations: [],
      notes: '',
      createdAt: new Date().toISOString()
    };
    
    if (!defaultTrip.destinations.includes(destinationId)) {
      defaultTrip.destinations.push(destinationId);
      const updatedTrips = tripPlans.filter(trip => trip.id !== 'default');
      updatedTrips.push(defaultTrip);
      setTripPlans(updatedTrips);
      localStorage.setItem('wandermap-trips', JSON.stringify(updatedTrips));
    }
  };

  const isDestinationSaved = (destinationId: string) => {
    return savedDestinations.some(saved => saved.id === destinationId);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      <Header 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={handleSearch}
        onToggleFilter={() => setFilterPanelOpen(!filterPanelOpen)}
        onToggleDarkMode={toggleDarkMode}
        onAuthClick={() => setAuthModalOpen(true)}
        searchQuery={filters.searchQuery}
        darkMode={darkMode}
        user={user}
        mapLabelLanguage={mapLabelLanguage}
        onMapLabelLanguageChange={setMapLabelLanguage}
      />

      <main className="flex h-[calc(100vh-4rem)]">
        {/* Filter Panel */}
        <FilterPanel 
          isOpen={filterPanelOpen}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setFilterPanelOpen(false)}
        />

        {/* Season Selector */}
        <div className="absolute z-20 top-20 left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow space-y-2">
          <div>
            <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Reisezeit (Monate)</div>
            <SeasonSelector value={{ months: seasonMonths }} onChange={(v)=>{
              setSeasonMonths(v.months);
              localStorage.setItem('wm-season-months', JSON.stringify(v.months));
            }} />
          </div>
          <div>
            <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Aktivität</div>
            <ActivitySelector value={activity} onChange={(v)=>{ setActivity(v); localStorage.setItem('wm-activity', v); }} />
            <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
              Strand: SST ≥23°C, Luft ≥22°C, Niederschlag ≤80mm · Wandern: 10–22°C, ≤90mm · Städte: 12–27°C, ≤100mm
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {activeTab === 'explore' && (
            <>
              {/* Map */}
              <div className="flex-1">
                <MapComponent 
                  destinations={filteredDestinations}
                  selectedDestination={selectedDestination}
                  onDestinationSelect={(dest) => {
                    setSelectedDestination(dest);
                    setSidebarOpen(true);
                  }}
                  mapLabelLanguage={mapLabelLanguage}
                  seasonMonths={seasonMonths}
                  activity={activity}
                />
              </div>

              {/* Destination Sidebar */}
              <DestinationSidebar 
                destination={selectedDestination}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onSave={saveDestination}
                onAddToTrip={addToTrip}
                isSaved={selectedDestination ? isDestinationSaved(selectedDestination.id) : false}
              />
            </>
          )}

          {activeTab === 'saved' && (
            <SavedDestinations 
              savedDestinations={savedDestinations}
              destinations={destinations}
              onRemove={removeSavedDestination}
              onSelect={(dest) => {
                setSelectedDestination(dest);
                setSidebarOpen(true);
              }}
            />
          )}

          {activeTab === 'planner' && (
            <TripPlanner 
              tripPlans={tripPlans}
              destinations={destinations}
              onUpdateTrips={setTripPlans}
            />
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={setUser}
      />
    </div>
  );
}

export default App;
