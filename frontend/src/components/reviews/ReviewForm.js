'use client';

import { useState } from 'react';
import { reviewsApi } from '@/lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={`text-2xl transition-colors ${s <= (hover || value) ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ bookingId, hotelId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    if (!rating) { toast.error('Please select a rating'); return; }
    try {
      await reviewsApi.create({ ...data, rating, bookingId, hotelId });
      toast.success('Review submitted! Thank you.');
      reset();
      setRating(0);
      onSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Write a Review</h3>

      <div>
        <label className="label">Rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="label">Title</label>
        <input className="input" placeholder="Summarize your stay" {...register('title', { required: 'Title is required' })} />
        {errors.title && <p className="error-message">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Review</label>
        <textarea
          rows={4}
          className="input resize-none"
          placeholder="Tell others about your experience…"
          {...register('comment', { required: 'Review is required', minLength: { value: 20, message: 'At least 20 characters' } })}
        />
        {errors.comment && <p className="error-message">{errors.comment.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
