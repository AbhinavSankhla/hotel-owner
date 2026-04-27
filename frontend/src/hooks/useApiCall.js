import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Generic hook for making API calls with loading/error state.
 * Usage: const { execute, loading, error } = useApiCall(someApiFunction);
 */
export function useApiCall(apiFunction) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFunction(...args);
        return res.data;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Something went wrong';
        setError(msg);
        toast.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { execute, loading, error };
}

/**
 * Hook for fetching data with auto-fetch on mount.
 */
export function useFetch(apiFunction, args = [], deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFunction(...args);
      setData(res.data.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Auto-fetch on mount or when deps change
  // (caller should pass deps that trigger refetch)
  return { data, loading, error, refetch };
}

/**
 * Extract error message from Axios error.
 */
export function getApiError(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}
