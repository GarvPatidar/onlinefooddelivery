import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ClipboardList, Clock, MapPin, Loader2, ArrowRight, Utensils, 
  CheckCircle, ArrowLeft, RefreshCw, AlertCircle, ShoppingBag
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my');
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'Accepted':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'Preparing':
        return 'bg-violet-50 text-violet-600 border border-violet-200';
      case 'Out For Delivery':
        return 'bg-orange-50 text-orange-600 border border-orange-200 animate-pulse';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-500 border border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const getStatusStepIndex = (status) => {
    const steps = ['Pending', 'Accepted', 'Preparing', 'Out For Delivery', 'Delivered'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-10 w-10 text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link to="/" className="p-2 hover:bg-white rounded-full transition border border-slate-100 bg-white/50">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <ClipboardList className="h-7 w-7 text-orange-500" />
              <span>My Orders</span>
            </h1>
            <p className="text-sm text-slate-500">Track and view your order history.</p>
          </div>
        </div>
        
        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white border border-slate-150 hover:bg-slate-50 text-slate-600 rounded-xl transition shadow-sm hover:shadow"
          title="Refresh orders"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 space-y-4 max-w-xl mx-auto shadow-sm">
          <ShoppingBag className="h-16 w-16 mx-auto text-slate-300" />
          <div className="space-y-1">
            <p className="font-bold text-slate-600 text-lg">No orders placed yet</p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              You haven't ordered anything yet. Browse restaurants and add foods to place your first order.
            </p>
          </div>
          <Link to="/" className="inline-flex items-center space-x-1.5 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition">
            <span>Order Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIndex = getStatusStepIndex(order.status);
            return (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6 transition hover:shadow-md hover:border-slate-200/60"
              >
                {/* Top Info Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-50 pb-5">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID: #{order.id.substring(0, 8).toUpperCase()}</p>
                    <h3 className="font-extrabold text-slate-800 text-xl flex items-center gap-1.5">
                      <Utensils className="h-5 w-5 text-orange-500" />
                      <span>{order.restaurant_name}</span>
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 pt-0.5">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                      <span>•</span>
                      <span>Payment: <strong className="text-slate-600">{order.payment_method}</strong></span>
                    </div>
                  </div>

                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-sm ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Tracking Progress Bar (Omit for Cancelled) */}
                {order.status !== 'Cancelled' && stepIndex !== -1 && (
                  <div className="py-2">
                    <div className="relative">
                      {/* Gray Line */}
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                      
                      {/* Active Colored Line */}
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-orange-400 to-orange-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                        style={{ width: `${(stepIndex / 4) * 100}%` }}
                      ></div>

                      {/* Steps */}
                      <div className="relative z-10 flex justify-between">
                        {['Placed', 'Accepted', 'Cooking', 'On Way', 'Delivered'].map((step, idx) => {
                          const isActive = idx <= stepIndex;
                          return (
                            <div key={step} className="flex flex-col items-center space-y-1.5">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black transition duration-300 border-2 ${
                                isActive 
                                  ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100' 
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}>
                                {isActive ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[10px] md:text-xs font-bold tracking-tight transition ${
                                isActive ? 'text-slate-800' : 'text-slate-400'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancelled Alert Box */}
                {order.status === 'Cancelled' && (
                  <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center space-x-2 text-red-600 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">This order was cancelled by the restaurant owner. Refund will be processed if applicable.</span>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Ordered</h4>
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-orange-500 text-xs bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-lg">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-slate-700">{item.food.name}</span>
                        </div>
                        <span className="font-extrabold text-slate-600">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery details and Total price */}
                <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 pt-2">
                  {/* Delivery Location Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-1 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span>Delivery Location</span>
                    </div>
                    <div className="text-xs leading-relaxed text-slate-500">
                      <p className="font-extrabold text-slate-700">{order.address.title} Address</p>
                      <p>{order.address.street_address}</p>
                      <p>{order.address.city}, {order.address.state} - {order.address.postal_code}</p>
                    </div>
                  </div>

                  {/* Pricing Cumulative */}
                  <div className="flex justify-between items-end w-full md:w-auto border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 md:space-x-8 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
                      <p className="text-2xl font-black text-slate-800 mt-0.5">${order.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
