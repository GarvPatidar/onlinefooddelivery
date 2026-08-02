import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Sparkles, Utensils, MapPin, Clock, Search, Navigation } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const res = await api.get('/restaurants');
      if (res.data?.success) {
        const list = res.data.data || [];
        setRestaurants(list);
        
        // Extract unique cities for filtering
        const uniqueCities = [...new Set(list.map(r => r.city).filter(Boolean))];
        setCities(uniqueCities);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter restaurants based on search and selected city
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === '' || r.city.toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-orange-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-200 animate-pulse" />
            <span>Delivering Happiness</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Hello, {user?.name || 'Valued Customer'}!
          </h1>
          <p className="text-lg text-white/90 max-w-lg font-light leading-relaxed">
            Order fresh food from top-rated restaurants nearby. Ready to browse and explore.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-2/3">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants, cuisines, dishes..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm text-slate-700 bg-slate-50/50"
          />
        </div>

        {/* City Filter */}
        <div className="relative w-full md:w-1/3 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm text-slate-600 bg-slate-50/50 cursor-pointer"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Popular Restaurants</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 space-y-3">
            <Utensils className="h-12 w-12 mx-auto text-slate-300 animate-bounce" />
            <p className="font-semibold text-slate-600">No restaurants found</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              We couldn't find any restaurants matching your filters. Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Link 
                key={restaurant.id} 
                to={`/restaurants/${restaurant.id}`}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-100/50 hover:border-orange-100 transition duration-300 flex flex-col h-full"
              >
                {/* Image Header */}
                <div className="h-44 relative bg-slate-50 overflow-hidden shrink-0">
                  {restaurant.image ? (
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-orange-500">
                      <Utensils className="h-12 w-12 group-hover:scale-110 transition duration-300" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 rounded-xl shadow-sm text-[10px] font-bold text-slate-600 flex items-center space-x-1 backdrop-blur-sm">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-orange-500 transition duration-300">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-light">
                      {restaurant.description || 'Tasty meals prepared fresh daily.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-50 pt-3 flex items-center text-xs text-slate-400 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-orange-500 mr-1 shrink-0" />
                    <span className="truncate">{restaurant.address}, {restaurant.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
