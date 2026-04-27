'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace('/auth/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email || '', phone: user.phone || '' });
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await userApi.updateProfile(data);
      updateUser(res.data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="error-message">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email')} />
            {user.email && !user.emailVerified && (
              <p className="text-xs text-amber-600 mt-1">Email not verified</p>
            )}
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>

          <button type="submit" disabled={saving || !isDirty} className="btn-primary w-full">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100">
        <h3 className="font-medium text-red-800 mb-1">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-3">Deactivating your account is permanent.</p>
        <button
          onClick={() => {
            if (confirm('Are you sure? This will deactivate your account.')) {
              userApi.deactivate().then(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                router.push('/');
              }).catch(() => toast.error('Failed to deactivate account'));
            }
          }}
          className="text-sm px-4 py-2 border border-red-300 text-red-700 rounded hover:bg-red-100 transition-colors"
        >
          Deactivate Account
        </button>
      </div>
    </main>
  );
}
