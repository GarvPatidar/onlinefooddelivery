import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ShoppingCart, Trash2, MapPin, CreditCard, ChevronRight, Plus, 
  Minus, ArrowLeft, Loader2, Sparkles, Building, Briefcase, Home, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' or 'Razorpay'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Address Modal Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    title: 'Home', // Default selection
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
  });

  useEffect(() => {
    fetchCartAndAddresses();
  }, []);

  const fetchCartAndAddresses = async () => {
    setLoading(true);
    try {
      const cartRes = await api.get('/cart');
      if (cartRes.data?.success) {
        setCart(cartRes.data.data);
      }

      const addrRes = await api.get('/addresses');
      if (addrRes.data?.success) {
        const addrList = addrRes.data.data || [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          setSelectedAddressId(addrList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load cart/addresses', err);
      toast.error('Failed to load cart details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (foodId, currentQty, increment) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;

    setActionLoading(true);
    try {
      const res = await api.post('/cart/items', {
        food_id: foodId,
        quantity: newQty
      });
      if (res.data?.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update item quantity');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveItem = async (foodId) => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/cart/items/${foodId}`);
      if (res.data?.success) {
        setCart(res.data.data);
        toast.success('Item removed from cart');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/addresses', addressForm);
      if (res.data?.success) {
        const newAddress = res.data.data;
        setAddresses([newAddress, ...addresses]);
        setSelectedAddressId(newAddress.id);
        setIsAddressModalOpen(false);
        setAddressForm({
          title: 'Home',
          street_address: '',
          city: '',
          state: '',
          postal_code: '',
        });
        toast.success('Address saved successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save address');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    setActionLoading(true);
    try {
      // 1. Create order
      const checkoutRes = await api.post('/orders/checkout', {
        address_id: selectedAddressId,
        payment_method: paymentMethod
      });

      if (!checkoutRes.data?.success) {
        throw new Error('Checkout failed');
      }

      const { order_id, total_price, razorpay_order_id, razorpay_key_id } = checkoutRes.data.data;

      // 2. COD checkout flow
      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully! Cash On Delivery.');
        navigate('/orders');
        return;
      }

      // 3. Razorpay payment checkout flow
      if (paymentMethod === 'Razorpay') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Razorpay SDK failed to load. Please try again.');
          setActionLoading(false);
          return;
        }

        const options = {
          key: razorpay_key_id || 'rzp_test_simulationkey', // Fallback key for simulation mode
          amount: Math.round(total_price * 100), // Amount in paise
          currency: 'INR',
          name: 'FastBites Platform',
          description: 'Payment for Order #' + order_id.substring(0, 8).toUpperCase(),
          order_id: razorpay_order_id,
          handler: async function (response) {
            setActionLoading(true);
            try {
              // 4. Verify Payment Signature
              const verifyRes = await api.post('/orders/verify', {
                razorpay_order_id: response.razorpay_order_id || razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature || 'sim_sig_success'
              });

              if (verifyRes.data?.success) {
                toast.success('Online Payment Successful!');
                navigate('/orders');
              } else {
                toast.error('Payment verification failed.');
              }
            } catch (err) {
              toast.error('Payment verification error');
              console.error(err);
            } finally {
              setActionLoading(false);
            }
          },
          prefill: {
            name: 'Customer',
            email: 'customer@example.com',
          },
          theme: {
            color: '#f97316', // Orange theme
          },
          modal: {
            ondismiss: function () {
              toast.error('Payment cancelled by user');
              setActionLoading(false);
            }
          }
        };

        const paymentWindow = new window.Razorpay(options);
        paymentWindow.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete checkout');
      console.error(err);
      setActionLoading(false);
    }
  };

  const getAddressIcon = (title) => {
    switch (title.toLowerCase()) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-10 w-10 text-orange-500" />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
  const deliveryFee = items.length > 0 ? 2.50 : 0;
  const tax = subtotal * 0.05; // 5% GST
  const grandTotal = subtotal + deliveryFee + tax;

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="p-2 hover:bg-white rounded-full transition border border-slate-100 bg-white/50">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-orange-500" />
            <span>Shopping Cart</span>
          </h1>
          <p className="text-sm text-slate-500">Confirm items and complete payment.</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 space-y-4 max-w-xl mx-auto shadow-sm">
          <ShoppingCart className="h-16 w-16 mx-auto text-slate-300 animate-pulse" />
          <div className="space-y-1">
            <p className="font-bold text-slate-600 text-lg">Your cart is empty</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Browse our restaurant list to add delicious food items to your order.
            </p>
          </div>
          <Link to="/" className="inline-flex items-center space-x-1.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition">
            <span>Browse Restaurants</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart Items & Addresses */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3">Selected Dishes</h2>
              
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex gap-4 items-center">
                      {item.food.image && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                          <img 
                            src={item.food.image} 
                            alt={item.food.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm md:text-base">{item.food.name}</h3>
                        <p className="text-orange-500 font-extrabold text-sm">${item.food.price.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-100 rounded-xl p-1 shrink-0">
                        <button
                          disabled={actionLoading || item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item.food_id, item.quantity, false)}
                          className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition disabled:opacity-50 text-slate-600"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-bold text-sm text-slate-800 w-4 text-center">{item.quantity}</span>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateQuantity(item.food_id, item.quantity, true)}
                          className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg transition text-slate-600"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.food_id)}
                        disabled={actionLoading}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition"
                        title="Remove dish"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Selection Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <span>Delivery Address</span>
                </h2>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 transition flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add New</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-slate-100 rounded-2xl space-y-2">
                  <p className="text-xs text-slate-400">No delivery address saved yet.</p>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs transition"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`relative p-4 rounded-2xl border-2 cursor-pointer transition flex gap-3 items-start select-none ${
                        selectedAddressId === addr.id 
                          ? 'border-orange-500 bg-orange-50/10' 
                          : 'border-slate-100 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address_select"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-orange-500 h-4 w-4"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400 shrink-0">{getAddressIcon(addr.title)}</span>
                          <span className="font-extrabold text-sm text-slate-800">{addr.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed truncate max-w-xs">{addr.street_address}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{addr.city}, {addr.state} - {addr.postal_code}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Billing & Payment */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3">Payment Method</h2>
              
              {/* Payment Select Option */}
              <div className="space-y-3">
                <label 
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition ${
                    paymentMethod === 'COD' 
                      ? 'border-orange-500 bg-orange-50/10 font-bold' 
                      : 'border-slate-100 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="payment_select" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-orange-500"
                    />
                    <div>
                      <p className="text-sm text-slate-800">Cash On Delivery (COD)</p>
                      <p className="text-[10px] text-slate-400 font-normal">Pay with cash upon arrival</p>
                    </div>
                  </div>
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </label>

                <label 
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition ${
                    paymentMethod === 'Razorpay' 
                      ? 'border-orange-500 bg-orange-50/10 font-bold' 
                      : 'border-slate-100 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input 
                      type="radio" 
                      name="payment_select" 
                      checked={paymentMethod === 'Razorpay'}
                      onChange={() => setPaymentMethod('Razorpay')}
                      className="accent-orange-500"
                    />
                    <div>
                      <p className="text-sm text-slate-800">Razorpay Secure Online</p>
                      <p className="text-[10px] text-slate-400 font-normal">Pay instantly using UPI/Cards/Wallet</p>
                    </div>
                  </div>
                  <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>Safe</span>
                  </div>
                </label>
              </div>

              {/* Bill Details */}
              <div className="border-t border-slate-50 pt-4 space-y-2 text-sm text-slate-500">
                <h3 className="font-bold text-slate-800 mb-1">Bill Details</h3>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-700">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-slate-700">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-100 my-2 pt-3 flex justify-between text-base font-extrabold text-slate-800">
                  <span>To Pay</span>
                  <span className="text-orange-500">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                disabled={actionLoading || items.length === 0}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <span>Proceed to Order</span>
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 text-center font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Secure payment processed by Razorpay Sandbox.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADDRESS ADD MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-1.5">
              <MapPin className="h-5.5 w-5.5 text-orange-500" />
              <span>Add Delivery Address</span>
            </h3>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              {/* Type Alias Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address Tag</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Home', 'Work', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, title: type })}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        addressForm.title === type
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressForm.street_address}
                  onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                  placeholder="Apartment, building, block, street address..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm"
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Postal / ZIP Code</label>
                <input
                  type="text"
                  required
                  value={addressForm.postal_code}
                  onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                  placeholder="e.g. 400001"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-1/2 py-3 bg-slate-50 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-3 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition text-sm shadow-md shadow-orange-100"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
