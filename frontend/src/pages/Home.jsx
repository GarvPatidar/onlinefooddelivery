import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ShoppingBag, MapPin, Award } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-orange-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-xl"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-sm font-semibold backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
            <span>Phase 1 Setup Success</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Hello, {user?.name || 'Valued Customer'}!
          </h1>
          <p className="text-lg text-white/90 max-w-lg font-light leading-relaxed">
            JWT authentication is fully active. You are logged in as a <strong className="font-semibold">Customer</strong>. Ready to browse restaurants once Phase 2 & 3 are deployed.
          </p>
        </div>
      </div>

      {/* Feature Checkpoints */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Browse Menu</h3>
            <p className="text-xs text-slate-400 mt-1">Order delicious meals from local culinary hot spots.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Fast Delivery</h3>
            <p className="text-xs text-slate-400 mt-1">Get your fresh food delivered right to your doorstep.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start space-x-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Premium Quality</h3>
            <p className="text-xs text-slate-400 mt-1">Highest hygiene standards and premium packaging.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
