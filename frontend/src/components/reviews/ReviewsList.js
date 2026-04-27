'use client';

import { useEffect, useState } from 'react';
import { reviewsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </div>
  );
}

export default function ReviewsList({ hotelId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState(null);

  const isAdmin = user?.role === 'HOTEL_ADMIN';

  useEffect(() => {
    setLoading(true);
    reviewsApi.getHotelReviews(hotelId, { page, limit: 10 })
      .then((res) => {
        const d = res.data.data;
        setReviews(d?.data || []);
        setTotalPages(d?.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [hotelId, page]);

  const submitReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    setSubmittingReply(reviewId);
    try {
      await reviewsApi.reply(reviewId, text);
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, ownerReply: text } : r));
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    } catch {
      // silent fail
    } finally {
      setSubmittingReply(null);
    }
  };

  if (loading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />)}</div>;
  if (reviews.length === 0) return <p className="text-gray-400 text-center py-8">No reviews yet. Be the first!</p>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{review.user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-400">{dayjs(review.createdAt).format('DD MMM YYYY')}</p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          {review.title && <p className="font-medium text-gray-800 text-sm mb-1">{review.title}</p>}
          <p className="text-gray-600 text-sm">{review.comment}</p>

          {review.ownerReply && (
            <div className="mt-3 pl-3 border-l-2 border-primary-200 bg-primary-50 rounded p-2">
              <p className="text-xs font-medium text-primary-700 mb-0.5">Hotel Response</p>
              <p className="text-sm text-gray-600">{review.ownerReply}</p>
            </div>
          )}

          {isAdmin && !review.ownerReply && (
            <div className="mt-3 flex gap-2">
              <input
                className="input text-sm flex-1"
                placeholder="Write a reply…"
                value={replyText[review.id] || ''}
                onChange={(e) => setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))}
              />
              <button
                onClick={() => submitReply(review.id)}
                disabled={submittingReply === review.id}
                className="btn-primary text-sm px-3 py-1.5"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm px-3 py-1.5">← Prev</button>
          <span className="text-sm text-gray-500 py-1.5">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary text-sm px-3 py-1.5">Next →</button>
        </div>
      )}
    </div>
  );
}
