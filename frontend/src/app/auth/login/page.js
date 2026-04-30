'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('email'); // 'email' | 'phone'

  const { register, handleSubmit, setError, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = await login(data);
      toast.success('Welcome back!');
      if (['HOTEL_ADMIN', 'HOTEL_STAFF'].includes(userData?.role)) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.length) {
        apiErrors.forEach(({ field, message }) => setError(field, { type: 'server', message }));
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Sign In</h1>
          <p className="text-center text-gray-500 text-sm mb-6">Welcome back to your account</p>

          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            <button type="button" onClick={() => setMode('email')} className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'email' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Email
            </button>
            <button type="button" onClick={() => setMode('phone')} className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-colors ${mode === 'phone' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
              Phone / OTP
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'email' ? (
              <>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
                  {errors.email && <p className="error-message">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" className="input" placeholder="••••••••" {...register('password', { required: 'Password is required' })} />
                  {errors.password && <p className="error-message">{errors.password.message}</p>}
                </div>
                <div className="text-right">
                  <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:underline">Forgot password?</Link>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input" placeholder="+919999999999" {...register('phone', { required: 'Phone is required' })} />
                  {errors.phone && <p className="error-message">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="label">Password (if set)</label>
                  <input type="password" className="input" placeholder="Leave blank to use OTP" {...register('password')} />
                </div>
                <p className="text-xs text-gray-500">Or <Link href="/auth/otp" className="text-primary-600 underline">sign in with OTP</Link></p>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary-600 hover:underline font-medium">Create account</Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm">
            <p className="font-semibold text-blue-900 mb-2">🔑 Demo Credentials</p>
            <div className="space-y-1.5 text-blue-800">
              <p><span className="font-medium">Admin:</span> admin@grandhorizon.com / Admin@123</p>
              <p><span className="font-medium">Guest:</span> guest@example.com / Guest@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
