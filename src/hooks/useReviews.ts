// Niumba - Reviews Hook
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPropertyReviews,
  getPropertyReviewStats,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
  type Review,
  type ReviewStats,
} from '../services/reviewService';

export const usePropertyReviews = (propertyId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadReviews = useCallback(async (
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' = 'newest',
    reset: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      const currentPage = reset ? 0 : page;
      const { data, count } = await getPropertyReviews(propertyId, {
        page: currentPage,
        pageSize: 10,
        sortBy,
      });

      if (reset) {
        setReviews(data);
        setPage(0);
      } else {
        setReviews((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 10 && (count || 0) > (currentPage + 1) * 10);
      if (reset) setPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  }, [propertyId, page]);

  const loadStats = useCallback(async () => {
    try {
      const data = await getPropertyReviewStats(propertyId);
      setStats(data);
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  }, [propertyId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      loadReviews('newest', false);
    }
  }, [loading, hasMore, loadReviews]);

  useEffect(() => {
    if (propertyId) {
      loadReviews('newest', true);
      loadStats();
    }
  }, [propertyId, loadReviews, loadStats]);

  return {
    reviews,
    stats,
    loading,
    error,
    hasMore,
    loadReviews,
    loadMore,
    refresh: () => {
      setPage(0);
      loadReviews('newest', true);
      loadStats();
    },
  };
};

export const useCreateReview = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (
    propertyId: string,
    rating: number,
    title?: string,
    comment?: string
  ): Promise<Review | null> => {
    if (!user) {
      setError('Vous devez être connecté pour laisser un avis');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const review = await createReview(propertyId, user.id, rating, title, comment);
      return review;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'avis';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { create, loading, error };
};

export const useUserReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data } = await getUserReviews(user.id);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user, loadReviews]);

  const update = useCallback(async (
    reviewId: string,
    updates: { rating?: number; title?: string; comment?: string }
  ) => {
    if (!user) return null;

    try {
      const review = await updateReview(reviewId, user.id, updates);
      if (review) {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? review : r)));
      }
      return review;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return null;
    }
  }, [user]);

  const remove = useCallback(async (reviewId: string) => {
    if (!user) return false;

    try {
      const success = await deleteReview(reviewId, user.id);
      if (success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  }, [user]);

  return {
    reviews,
    loading,
    error,
    update,
    remove,
    refresh: loadReviews,
  };
};

export default usePropertyReviews;



