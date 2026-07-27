import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await login(data.email, data.password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      if (result.user.role === 'restaurant_owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <div className="text-center md:text-left mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-2">Log in to order delicious food or manage your restaurant.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Mail className="h-5 w-5" />
            </span>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`block w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs font-medium text-red-500 mt-1.5 pl-1">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-5 w-5" />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={`block w-full pl-10 pr-12 py-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-red-500 mt-1.5 pl-1">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-300 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200/50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Log In</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
