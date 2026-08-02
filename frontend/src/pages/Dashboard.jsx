import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  LayoutDashboard, Store, ClipboardList, Utensils, Coins, 
  Plus, Edit, Trash2, Clock, MapPin, X, Check, Eye
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Restaurant Form State
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    opening_time: '09:00',
    closing_time: '22:00',
    image: '',
  });
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);

  // Food Form State
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    availability: true,
    image: '',
  });
  const [editingFood, setEditingFood] = useState(null); // If not null, we are editing
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, []);

  const fetchRestaurantAndMenu = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch current owner's restaurant
      const res = await api.get('/restaurants/my');
      if (res.data?.success && res.data.data) {
        const restData = res.data.data;
        setRestaurant(restData);
        setRestaurantForm(restData);
        
        // 2. Fetch food items for this restaurant
        const foodRes = await api.get(`/restaurants/${restData.id}/foods`);
        if (foodRes.data?.success) {
          setFoods(foodRes.data.data || []);
        }
      } else {
        setRestaurant(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let res;
      if (restaurant) {
        // Update
        res = await api.put(`/restaurants/${restaurant.id}`, restaurantForm);
      } else {
        // Create
        res = await api.post('/restaurants', restaurantForm);
      }

      if (res.data?.success) {
        setRestaurant(res.data.data);
        setIsRestModalOpen(false);
        fetchRestaurantAndMenu();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save restaurant details');
    }
  };

  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...foodForm,
        price: parseFloat(foodForm.price),
      };

      let res;
      if (editingFood) {
        // Update
        res = await api.put(`/foods/${editingFood.id}`, payload);
      } else {
        // Create
        res = await api.post(`/restaurants/${restaurant.id}/foods`, payload);
      }

      if (res.data?.success) {
        setIsFoodModalOpen(false);
        setFoodForm({ name: '', description: '', price: '', availability: true, image: '' });
        setEditingFood(null);
        fetchRestaurantAndMenu();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save food item');
    }
  };

  const handleEditFoodClick = (food) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      availability: food.availability,
      image: food.image || '',
    });
    setIsFoodModalOpen(true);
  };

  const handleDeleteFoodClick = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    setError('');
    try {
      const res = await api.delete(`/foods/${foodId}`);
      if (res.data?.success) {
        setFoods(foods.filter(f => f.id !== foodId));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete food item');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Store Owner Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your food store details and menu items.</p>
        </div>
        {restaurant && (
          <button
            onClick={() => {
              setRestaurantForm(restaurant);
              setIsRestModalOpen(true);
            }}
            className="flex items-center space-x-1 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Store Info</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Conditional Rendering: No Restaurant Setup Yet */}
      {!restaurant ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-100/50 max-w-2xl mx-auto text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
            <Store className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">Setup Your Restaurant</h2>
            <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
              You haven't configured a restaurant profile yet. Add your restaurant details to start listing food items for customers.
            </p>
          </div>
          <button
            onClick={() => setIsRestModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition hover:-translate-y-0.5"
          >
            Add Restaurant Details
          </button>
        </div>
      ) : (
        <>
          {/* Restaurant Stats Banner */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="absolute top-0 right-0 w-84 h-84 bg-orange-500/10 rounded-full translate-x-16 -translate-y-16 blur-2xl pointer-events-none"></div>
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-orange-400">
                <Store className="h-3.5 w-3.5" />
                <span>Active Restaurant</span>
              </div>
              <h2 className="text-3xl font-black">{restaurant.name}</h2>
              <p className="text-sm text-slate-300 max-w-xl font-light leading-relaxed">
                {restaurant.description || "No description provided."}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-orange-400" />
                  <span>{restaurant.address}, {restaurant.city}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span>{restaurant.opening_time} - {restaurant.closing_time}</span>
                </div>
              </div>
            </div>

            {restaurant.image && (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-slate-700 shrink-0">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Menu Items</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{foods.length}</p>
              </div>
              <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                <Utensils className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Status</p>
                <p className="text-lg font-bold text-emerald-600 mt-1">Accepting Orders</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                <Check className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Revenue</p>
                <p className="text-2xl font-black text-slate-800 mt-1">$0.00</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                <Coins className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Menu Management Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Menu List</h3>
              <button
                onClick={() => {
                  setEditingFood(null);
                  setFoodForm({ name: '', description: '', price: '', availability: true, image: '' });
                  setIsFoodModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-100 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Dish</span>
              </button>
            </div>

            {foods.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 space-y-2">
                <Utensils className="h-10 w-10 mx-auto text-slate-300" />
                <p className="font-medium text-slate-600">No dishes on the menu yet</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Create your first food item by clicking the "Add Dish" button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {foods.map((food) => (
                  <div key={food.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {food.image && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img 
                            src={food.image} 
                            alt={food.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800">{food.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            food.availability 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-red-50 text-red-500 border border-red-100'
                          }`}>
                            {food.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed max-w-sm">{food.description}</p>
                        <p className="text-orange-500 font-extrabold text-sm">${food.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex space-x-1 shrink-0">
                      <button
                        onClick={() => handleEditFoodClick(food)}
                        className="p-2 text-slate-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition"
                        title="Edit Dish"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFoodClick(food.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                        title="Delete Dish"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* RESTAURANT MODAL */}
      {isRestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsRestModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Store className="h-6 w-6 text-orange-500" />
              <span>{restaurant ? 'Edit Restaurant details' : 'Create Restaurant'}</span>
            </h3>

            <form onSubmit={handleRestaurantSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={restaurantForm.name}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                  placeholder="e.g. The Spicy Bistro"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={restaurantForm.description}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
                  placeholder="Tell customers about your kitchen highlights..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <input
                    type="text"
                    required
                    value={restaurantForm.address}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                    placeholder="123 Main St"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    value={restaurantForm.city}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opening Time</label>
                  <input
                    type="text"
                    required
                    value={restaurantForm.opening_time}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, opening_time: e.target.value })}
                    placeholder="e.g. 09:00"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closing Time</label>
                  <input
                    type="text"
                    required
                    value={restaurantForm.closing_time}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, closing_time: e.target.value })}
                    placeholder="e.g. 22:00"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Image URL</label>
                <input
                  type="url"
                  value={restaurantForm.image}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition"
              >
                Save Restaurant details
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOD ITEM MODAL */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsFoodModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Utensils className="h-6 w-6 text-orange-500" />
              <span>{editingFood ? 'Edit Menu Item' : 'Add New Dish'}</span>
            </h3>

            <form onSubmit={handleFoodSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dish Name</label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Margherita Pizza"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="Fresh mozzarella, cherry tomatoes, and basil leaves..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    placeholder="12.99"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-end pb-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition">
                    <input
                      type="checkbox"
                      checked={foodForm.availability}
                      onChange={(e) => setFoodForm({ ...foodForm, availability: e.target.checked })}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 h-4 w-4"
                    />
                    <span className="text-sm font-bold text-slate-700 select-none">Available</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dish Image URL</label>
                <input
                  type="url"
                  value={foodForm.image}
                  onChange={(e) => setFoodForm({ ...foodForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition"
              >
                {editingFood ? 'Update Dish' : 'Add Dish to Menu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
