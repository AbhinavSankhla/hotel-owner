'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, hotelsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Link from 'next/link';

const HOTEL_ID = '11111111-1111-1111-1111-111111111111';

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hotel, setHotel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('tax');

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'HOTEL_ADMIN')) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'HOTEL_ADMIN') return;
    hotelsApi.getById(HOTEL_ID)
      .then((res) => {
        const h = res.data.data;
        setHotel(h);
        reset({
          gstRate: ((h.gstRate ?? 0.12) * 100).toFixed(0),
          checkInTime: h.checkInTime || '14:00',
          checkOutTime: h.checkOutTime || '11:00',
          name: h.name || '',
          phone: h.phone || '',
          email: h.email || '',
          address: h.address || '',
          city: h.city || '',
          state: h.state || '',
          pincode: h.pincode || '',
        });
      })
      .catch(() => toast.error('Failed to load hotel settings'));
  }, [user, reset]);

  const onSave = async (data) => {
    setSaving(true);
    try {
      const gstRate = parseFloat(data.gstRate) / 100;
      if (isNaN(gstRate) || gstRate < 0 || gstRate > 1) {
        toast.error('GST rate must be between 0 and 100');
        setSaving(false);
        return;
      }
      await adminApi.updateHotel({ ...data, gstRate });
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  const tabs = [
    { id: 'tax', label: '💰 Tax & GST' },
    { id: 'timing', label: '🕐 Check-in Times' },
    { id: 'contact', label: '📞 Contact Info' },
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Hotel Settings</h1>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSave)}>
        {/* Tax & GST */}
        {activeTab === 'tax' && (
          <div className="card p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">GST / Tax Settings</h2>
              <p className="text-sm text-gray-500 mb-4">
                This rate is applied to all bookings. Current rate affects new bookings only — existing bookings retain their original tax.
              </p>

              <div>
                <label className="label">GST Rate (%)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="input pr-8"
                      placeholder="12"
                      {...register('gstRate', {
                        required: 'GST rate is required',
                        min: { value: 0, message: 'Cannot be negative' },
                        max: { value: 100, message: 'Cannot exceed 100%' },
                      })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">%</span>
                  </div>
                  <span className="text-sm text-gray-500">e.g. 12 for 12% GST</span>
                </div>
                {errors.gstRate && <p className="error-message">{errors.gstRate.message}</p>}
              </div>

              {/* Preview */}
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm">
                <p className="font-semibold text-blue-900 mb-2">📊 Example for ₹3,500/night booking (2 nights)</p>
                <div className="space-y-1 text-blue-800">
                  <div className="flex justify-between">
                    <span>Room charges (2 nights)</span>
                    <span>₹7,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (12%)</span>
                    <span>₹840</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-blue-200 pt-1 mt-1">
                    <span>Total</span>
                    <span>₹7,840</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Check-in Times */}
        {activeTab === 'timing' && (
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Check-in / Check-out Times</h2>
            <p className="text-sm text-gray-500 mb-4">These times are shown to guests on booking confirmation.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Check-in Time</label>
                <input type="time" className="input" {...register('checkInTime')} />
              </div>
              <div>
                <label className="label">Check-out Time</label>
                <input type="time" className="input" {...register('checkOutTime')} />
              </div>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {activeTab === 'contact' && (
          <div className="card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Hotel Contact Information</h2>
            <div>
              <label className="label">Hotel Name</label>
              <input className="input" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="+910000000000" {...register('phone')} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="hotel@example.com" {...register('email')} />
              </div>
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" {...register('address')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">City</label>
                <input className="input" {...register('city')} />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input" {...register('state')} />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input className="input" {...register('pincode')} />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button type="submit" disabled={saving} className="btn-primary px-8">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </main>
  );
}
