import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  FastForward, 
  ShoppingCart, 
  ClipboardList, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Utensils,
  FolderTree,
  Store
} from 'lucide-react';

const MainLayout = () => {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchCartCount();
    }
  }, [user, location.pathname]);

  const fetchCartCount = async () => {
    try {
      const res = await api.get('/cart');
      if (res.data?.success && res.data.data) {
        const count = res.data.data.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const isOwner = user.role === 'restaurant_owner';

  // Navigation config for Customer
  const customerNav = [
    { name: 'Browse', path: '/' },
    { name: 'Orders', path: '/orders', icon: ClipboardList },
    { name: 'Cart', path: '/cart', icon: ShoppingCart },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  // Navigation config for Owner Sidebar
  const ownerNav = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'My Restaurant', path: '/owner/restaurant', icon: Store },
    { name: 'Categories', path: '/owner/categories', icon: FolderTree },
    { name: 'Menu & Food', path: '/owner/foods', icon: Utensils },
    { name: 'Orders', path: '/owner/orders', icon: ClipboardList },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  if (isOwner) {
    // Restaurant Owner Layout with Sidebar
    return (
      <div className="min-h-screen flex bg-slate-50">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200">
          <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-orange-500 to-red-500 p-1.5 rounded-lg">
              <FastForward className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wide text-slate-800">Owner Portal</span>
          </div>

          <div className="flex-1 px-4 py-6 space-y-1">
            {ownerNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4 px-2">
              <div>
                <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                <p className="text-xs text-slate-400">Restaurant Partner</p>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area for Owner */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar for Mobile Menu and Notifications */}
          <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 md:justify-end">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-slate-600 hidden md:block">Welcome, {user.name}</span>
              <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
              <div className="relative flex flex-col w-64 max-w-xs bg-white h-full shadow-2xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <FastForward className="h-6 w-6 text-orange-500" />
                    <span className="font-bold text-lg text-slate-800">Owner Portal</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 rounded-lg hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-1">
                  {ownerNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium ${
                          isActive
                            ? 'bg-orange-50 text-orange-600'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 mt-auto"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}

          {/* View outlet */}
          <main className="flex-1 overflow-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  // Customer Layout with Navbar
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
                <div className="bg-gradient-to-tr from-orange-500 to-red-500 p-1.5 rounded-lg">
                  <FastForward className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-wider text-slate-800">FastBites</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Browse</Link>
                <Link to="/orders" className="text-sm font-medium text-slate-600 hover:text-slate-900">Orders</Link>
              </nav>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-orange-500 transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-black leading-none text-white bg-orange-500 rounded-full translate-x-1 -translate-y-1">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/profile" className="flex items-center space-x-2 text-slate-700 hover:text-slate-900">
                <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold">{user.name}</span>
              </Link>
              <button
                onClick={handleLogoutClick}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Hamburger button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {customerNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogoutClick}
                className="w-full text-left block px-3 py-2.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} FastBites. Made with ❤️.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
