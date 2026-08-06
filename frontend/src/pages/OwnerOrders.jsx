import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ClipboardList, Clock, MapPin, Loader2, Play, Check, 
  Trash2, User, AlertCircle, RefreshCw, Sparkles, Navigation
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const OwnerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchIncomingOrders();
  }, []);

  const fetchIncomingOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/orders');
      if (res.data?.success) {
        setOrders(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load incoming orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    switch (currentStatus) {
      case 'Pending':
        nextStatus = 'Accepted';
        break;
      case 'Accepted':
        nextStatus = 'Preparing';
        break;
      case 'Preparing':
        nextStatus = 'Out For Delivery';
        break;
      case 'Out For Delivery':
        nextStatus = 'Delivered';
        break;
      default:
        return;
    }

    setActionLoading(true);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      if (res.data?.success) {
        toast.success(`Order status updated to: ${nextStatus}`);
        // Update local state
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setActionLoading(true);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'Cancelled' });
      if (res.data?.success) {
        toast.success('Order cancelled');
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Accepted':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Preparing':
        return 'text-violet-600 bg-violet-50 border-violet-200';
      case 'Out For Delivery':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Delivered':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getActionButtonLabel = (status) => {
    switch (status) {
      case 'Pending':
        return 'Accept Order';
      case 'Accepted':
        return 'Start Preparing';
      case 'Preparing':
        return 'Out for Delivery';
      case 'Out For Delivery':
        return 'Mark Delivered';
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin h-10 w-10 text-orange-500" />
      </div>
    );
  }

  // Filter out completed/cancelled orders for priority view if needed
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-orange-500" />
            <span>Incoming Orders</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Accept, track, and manage orders from your customers.</p>
        </div>
        <button
          onClick={fetchIncomingOrders}
          disabled={actionLoading}
          className="p-2.5 bg-white border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl transition shadow-sm hover:shadow shrink-0"
          title="Refresh orders"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 max-w-lg mx-auto shadow-sm">
          <AlertCircle className="h-12 w-12 mx-auto text-slate-300" />
          <p className="font-bold text-slate-600 mt-2">No orders received yet</p>
          <p className="text-xs text-slate-400 mt-1">Once customers purchase dishes from your menu, they will appear here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Active Orders Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
              <span>Active Orders ({activeOrders.length})</span>
            </h2>

            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-xs">
                All caught up! No active orders currently pending.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {activeOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-stretch transition hover:shadow hover:border-slate-200"
                  >
                    {/* Left: Customer Info, Items & Metadata */}
                    <div className="space-y-4 flex-grow">
                      {/* Order Details Title */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                        <span className="font-bold text-slate-700">Order ID: #{order.id.substring(0, 8).toUpperCase()}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
                        <User className="h-4.5 w-4.5 text-orange-500" />
                        <span>Customer Reference</span>
                      </div>

                      {/* Items List */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 max-w-xl space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-xs font-medium text-slate-700">
                            <span>{item.quantity}x {item.food.name}</span>
                            <span className="font-extrabold text-slate-500">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between text-xs font-black text-slate-800">
                          <span>Total Earnings</span>
                          <span className="text-orange-500">${order.total_price.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Delivery Details */}
                      <div className="flex items-start space-x-1.5 text-xs text-slate-500 leading-relaxed">
                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-700">{order.address.title} Address</p>
                          <p>{order.address.street_address}, {order.address.city}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions Column */}
                    <div className="flex flex-row md:flex-col justify-end md:justify-center items-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      {getActionButtonLabel(order.status) && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleUpdateStatus(order.id, order.status)}
                          className="w-full md:w-44 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-100 transition flex items-center justify-center space-x-1.5"
                        >
                          <Play className="h-3.5 w-3.5 fill-white" />
                          <span>{getActionButtonLabel(order.status)}</span>
                        </button>
                      )}
                      
                      {(order.status === 'Pending' || order.status === 'Accepted') && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCancelOrder(order.id)}
                          className="py-3 px-4 md:w-44 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Orders Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-500">Completed & Cancelled Orders ({pastOrders.length})</h2>
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Time</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Earnings</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {pastOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-700">#{order.id.substring(0, 8).toUpperCase()}</td>
                        <td className="p-4 text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="p-4 max-w-xs truncate">
                          {order.items.map(i => `${i.quantity}x ${i.food.name}`).join(', ')}
                        </td>
                        <td className="p-4 font-extrabold text-slate-800">${order.total_price.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerOrders;
