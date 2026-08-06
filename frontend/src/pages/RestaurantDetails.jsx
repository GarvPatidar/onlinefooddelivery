import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, MapPin, Clock, Utensils, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurantAndFoods();
  }, [id]);

  const fetchRestaurantAndFoods = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Restaurant Info
      const res = await api.get(`/restaurants/${id}`);
      if (res.data?.success) {
        setRestaurant(res.data.data);
      }

      // Fetch Restaurant Foods
      const foodsRes = await api.get(`/restaurants/${id}/foods`);
      if (foodsRes.data?.success) {
        setFoods(foodsRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (foodId, foodName) => {
    try {
      const res = await api.post('/cart/items', {
        food_id: foodId,
        quantity: 1
      });
      if (res.data?.success) {
        toast.success(`${foodName} added to cart!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4 p-8">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-slate-800">Error Loading Restaurant</h2>
        <p className="text-slate-500">{error || 'Restaurant details could not be found.'}</p>
        <Link to="/" className="inline-flex items-center space-x-1.5 text-orange-500 hover:text-orange-600 font-bold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4">
      {/* Back navigation */}
      <Link to="/" className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-orange-500 transition font-semibold text-sm">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Restaurants</span>
      </Link>

      {/* Restaurant Header */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col md:flex-row">
        {restaurant.image ? (
          <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-slate-50">
            <img 
              src={restaurant.image} 
              alt={restaurant.name} 
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        ) : (
          <div className="md:w-1/3 h-48 md:h-auto bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-orange-500">
            <Utensils className="h-16 w-16" />
          </div>
        )}
        <div className="p-6 md:p-8 md:w-2/3 space-y-4 flex flex-col justify-center">
          <h1 className="text-3xl font-black text-slate-800 leading-tight">{restaurant.name}</h1>
          <p className="text-sm text-slate-500 leading-relaxed">{restaurant.description || 'No description provided.'}</p>
          
          <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-orange-500" />
              <span>{restaurant.address}, {restaurant.city}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Timings: {restaurant.opening_time} - {restaurant.closing_time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Food items list */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Menu items</h2>

        {foods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
            <p className="font-semibold text-slate-500">This restaurant hasn't added any dishes yet.</p>
            <p className="text-xs text-slate-400 mt-1">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {foods.map((food) => (
              <div key={food.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-center justify-between">
                <div className="flex gap-4 items-center">
                  {food.image && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <img 
                        src={food.image} 
                        alt={food.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800">{food.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed max-w-xs">{food.description}</p>
                    <p className="text-orange-500 font-extrabold text-sm">${food.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {food.availability ? (
                    <button
                      onClick={() => handleAddToCart(food.id, food.name)}
                      className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold transition shadow-sm hover:shadow"
                    >
                      Add +
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[10px] font-bold">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;
