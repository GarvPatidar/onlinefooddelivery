import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Mail, Lock, User as UserIcon, UserCheck, Store } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  role: z.enum(['customer', 'restaurant_owner'], {
    required_error: 'Role is required',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', role: 'customer' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await signup(data.name, data.email, data.password, data.role);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Account created successfully! Welcome, ${result.user.name}`);
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
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Account</h2>
        <p className="text-sm text-slate-500 mt-2">Join us to order food or grow your food business.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Role Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">I want to...</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue('role', 'customer')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                selectedRole === 'customer'
                  ? 'border-orange-500 bg-orange-50/50 text-orange-600 font-semibold ring-2 ring-orange-200'
                  : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <UserCheck className="h-5 w-5 mb-1.5" />
              <span className="text-xs">Order Food</span>
            </button>

            <button
              type="button"
              onClick={() => setValue('role', 'restaurant_owner')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                selectedRole === 'restaurant_owner'
                  ? 'border-orange-500 bg-orange-50/50 text-orange-600 font-semibold ring-2 ring-orange-200'
                  : 'border-slate-200 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Store className="h-5 w-5 mb-1.5" />
              <span className="text-xs">Sell Food</span>
            </button>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <UserIcon className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="John Doe"
              {...register('name')}
              className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                errors.name ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.name.message}</p>}
        </div>

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
              className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
              }`}
            />
          </div>
          {errors.email && <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.email.message}</p>}
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
              className={`block w-full pl-10 pr-12 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Lock className="h-5 w-5" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={`block w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
              }`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-red-500 mt-1 pl-1">{errors.confirmPassword.message}</p>
          )}
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Sign Up</span>
          )}
        </button>
      </form>

      {/* Footer link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-orange-500 hover:text-orange-600 transition-colors">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
