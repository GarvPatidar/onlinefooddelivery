import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User as UserIcon, Lock, Loader2, Save } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfileUpdate = async (data) => {
    setProfileLoading(true);
    try {
      const response = await api.put('/auth/profile', { name: data.name });
      if (response.data?.success) {
        setUser((prev) => ({ ...prev, name: response.data.data.name }));
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.data?.error || 'Profile update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordUpdate = async (data) => {
    setPasswordLoading(true);
    try {
      const response = await api.put('/auth/change-password', {
        old_password: data.oldPassword,
        new_password: data.newPassword,
      });
      if (response.data?.success) {
        toast.success('Password updated successfully!');
        resetPasswordForm();
      } else {
        toast.error(response.data?.error || 'Password update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account information and password settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Profile Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-orange-500" />
              <span>Personal Details</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Update your display name here.</p>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                {...registerProfile('name')}
                className={`block w-full px-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                  profileErrors.name ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
                }`}
              />
              {profileErrors.name && (
                <p className="text-xs font-medium text-red-500 mt-1 pl-1">{profileErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100/70 text-slate-400 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1 pl-1">Email cannot be changed.</p>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-white font-semibold bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {profileLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              <span>Save Profile</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <Lock className="h-5 w-5 text-orange-500" />
              <span>Change Password</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Keep your account secure with a strong password.</p>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...registerPassword('oldPassword')}
                className={`block w-full px-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                  passwordErrors.oldPassword ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
                }`}
              />
              {passwordErrors.oldPassword && (
                <p className="text-xs font-medium text-red-500 mt-1 pl-1">{passwordErrors.oldPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...registerPassword('newPassword')}
                className={`block w-full px-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                  passwordErrors.newPassword ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="text-xs font-medium text-red-500 mt-1 pl-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...registerPassword('confirmPassword')}
                className={`block w-full px-4 py-2.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-200 ${
                  passwordErrors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'focus:border-orange-500 focus:ring-orange-200'
                }`}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs font-medium text-red-500 mt-1 pl-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-white font-semibold bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {passwordLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
