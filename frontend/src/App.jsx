import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Context & Guards
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Customer Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"><h2 className="text-xl font-bold">My Orders</h2><p className="text-slate-500 mt-2">Order tracking will be enabled in Phase 4.</p></div>} />
              <Route path="/cart" element={<div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"><h2 className="text-xl font-bold">Shopping Cart</h2><p className="text-slate-500 mt-2">Shopping cart details will be enabled in Phase 3.</p></div>} />
            </Route>

            {/* Protected Restaurant Owner Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['restaurant_owner']}>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/owner/dashboard" element={<Dashboard />} />
              <Route path="/owner/restaurant" element={<div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"><h2 className="text-xl font-bold">Restaurant Management</h2><p className="text-slate-500 mt-2">Restaurant details management will be enabled in Phase 2.</p></div>} />
              <Route path="/owner/categories" element={<div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"><h2 className="text-xl font-bold">Category Management</h2><p className="text-slate-500 mt-2">Food categories CRUD will be enabled in Phase 2.</p></div>} />
              <Route path="/owner/foods" element={<div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"><h2 className="text-xl font-bold">Menu & Food Items</h2><p className="text-slate-500 mt-2">Food inventory management will be enabled in Phase 2.</p></div>} />
              <Route path="/owner/orders" element={<div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm"><h2 className="text-xl font-bold">Incoming Orders</h2><p className="text-slate-500 mt-2">Order fulfillment will be enabled in Phase 4.</p></div>} />
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f1f5f9',
                padding: '12px 16px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#f97316',
                  secondary: '#ffffff',
                },
              },
            }} 
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
