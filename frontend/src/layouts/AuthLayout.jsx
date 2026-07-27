import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FastForward } from 'lucide-react';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If user is already authenticated, redirect to home or dashboard
  if (user) {
    const target = user.role === 'restaurant_owner' ? '/owner/dashboard' : '/';
    return <Navigate to={target} replace />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Brand & Left Section (Desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-tr from-orange-600 via-red-500 to-amber-500 text-white relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-12 -translate-y-12 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-12 translate-y-12 blur-2xl"></div>

        <div className="flex items-center space-x-3 z-10">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <FastForward className="h-8 w-8 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider">FastBites</span>
        </div>

        <div className="z-10 max-w-md">
          <h1 className="text-5xl font-black leading-tight mb-6">
            Satisfy Your Cravings in Seconds.
          </h1>
          <p className="text-lg text-white/90 font-light leading-relaxed">
            Order delicious food from top-rated restaurants near you, or manage your restaurant business efficiently. All in one place.
          </p>
        </div>

        <div className="z-10 text-sm text-white/70">
          © {new Date().getFullYear()} FastBites. All rights reserved.
        </div>
      </div>

      {/* Form Container (Right Side) */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
          {/* Small Logo for Mobile */}
          <div className="flex lg:hidden items-center justify-center space-x-2 mb-8">
            <div className="bg-gradient-to-tr from-orange-500 to-red-500 p-2 rounded-xl">
              <FastForward className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-wider text-slate-800">FastBites</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
