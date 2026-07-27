import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Store, ClipboardList, Utensils, Coins } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Owner Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your food store, inventory, and active customer orders.</p>
      </div>

      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-orange-400">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Management Console</span>
          </div>
          <h2 className="text-3xl font-black">Welcome back, {user?.name}!</h2>
          <p className="text-sm text-slate-300 max-w-lg font-light leading-relaxed">
            Phase 1 is successfully running. Authentication state and owner privileges are confirmed. You will be able to setup your restaurant, define food categories, and edit food items in Phase 2.
          </p>
        </div>
      </div>

      {/* Dummy Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Store Status</p>
            <p className="text-lg font-bold text-slate-800 mt-1">No Restaurant Yet</p>
          </div>
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <Store className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Orders</p>
            <p className="text-2xl font-black text-slate-800 mt-1">0</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu Items</p>
            <p className="text-2xl font-black text-slate-800 mt-1">0</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Utensils className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Revenue</p>
            <p className="text-2xl font-black text-slate-800 mt-1">$0.00</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
            <Coins className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
