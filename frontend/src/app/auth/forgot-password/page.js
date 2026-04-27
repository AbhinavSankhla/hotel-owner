'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm card p-8 text-center">
          <div className="text-5xl mb-4">📬</div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">We sent a password reset link. It expires in 1 hour.</p>
          <Link href="/auth/login" className="btn-primary w-full">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm card p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Enter your email to receive a reset link</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="error-message">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/auth/login" className="text-primary-600 hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
