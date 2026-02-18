// Niumba - Review Service
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { errorLog, warnLog } from '../utils/logHelper';

export interface Review {
  id: string;
  property_id: string;
  user_id: string; // Changed from reviewer_id to match schema
  rating: number; // 1-5
  title: string | null;
  comment: string | null;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  reviewer?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  property?: {
    id: string;
    title: string;
  };
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Get reviews for a property
 */
export const getPropertyReviews = async (
  propertyId: string,
  options: {
    page?: number;
    pageSize?: number;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  } = {}
): Promise<{ data: Review[]; count: number }> => {
  const { page = 0, pageSize = 10, sortBy = 'newest' } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        reviewer:profiles!user_id(id, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('property_id', propertyId)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'highest':
        query = query.order('rating', { ascending: false });
        break;
      case 'lowest':
        query = query.order('rating', { ascending: true });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
    }

    const { data, error, count } = await query;

    if (error) {
      // Handle table not found error gracefully
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Reviews table not found in Supabase. Please create the table or configure Supabase.');
        return { data: [], count: 0 };
      }
      throw error;
    }

    return {
      data: (data || []) as Review[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching reviews', error instanceof Error ? error : new Error(String(error)), { propertyId });
    return { data: [], count: 0 };
  }
};

/**
 * Get review statistics for a property
 */
export const getPropertyReviewStats = async (
  propertyId: string
): Promise<ReviewStats | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('property_id', propertyId);

    if (error) {
      // Handle table not found error gracefully
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        warnLog('Reviews table not found in Supabase.');
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const total = data.length;
    const sum = data.reduce((acc, r) => acc + ((r as any).rating || 0), 0);
    const average = sum / total;

    const distribution = {
      5: data.filter((r) => (r as any).rating === 5).length,
      4: data.filter((r) => (r as any).rating === 4).length,
      3: data.filter((r) => (r as any).rating === 3).length,
      2: data.filter((r) => (r as any).rating === 2).length,
      1: data.filter((r) => (r as any).rating === 1).length,
    };

    return {
      average_rating: Math.round(average * 10) / 10,
      total_reviews: total,
      rating_distribution: distribution,
    };
  } catch (error) {
    errorLog('Error fetching review stats', error instanceof Error ? error : new Error(String(error)), { propertyId });
    return null;
  }
};

/**
 * Create a review
 */
export const createReview = async (
  propertyId: string,
  reviewerId: string,
  rating: number,
  title?: string,
  comment?: string
): Promise<Review | null> => {
  if (!isSupabaseConfigured()) return null;

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  try {
    // Check if user already reviewed this property
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('property_id', propertyId)
      .eq('user_id', reviewerId)
      .maybeSingle();

    if (existing) {
      throw new Error('You have already reviewed this property');
    }

    // @ts-ignore - TypeScript issue with Supabase insert types
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        property_id: propertyId,
        user_id: reviewerId, // Changed from reviewer_id to user_id
        rating,
        title: title || null,
        comment: comment || null,
        is_verified: false, // Can be verified if user booked/appointed
      } as any)
      .select(`
        *,
        reviewer:profiles!user_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Update property's average rating (if there's a trigger, this is handled automatically)
    // Otherwise, we could call an RPC function here

    return data as Review;
  } catch (error) {
    errorLog('Error creating review', error instanceof Error ? error : new Error(String(error)), { propertyId, rating, title, comment });
    throw error;
  }
};

/**
 * Update a review
 */
export const updateReview = async (
  reviewId: string,
  reviewerId: string,
  updates: {
    rating?: number;
    title?: string;
    comment?: string;
  }
): Promise<Review | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    // Verify ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (!review || (review as any).user_id !== reviewerId) {
      throw new Error('You can only update your own reviews');
    }

    const { data, error } = await (supabase
      .from('reviews') as any)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', reviewId)
      .select(`
        *,
        reviewer:profiles!user_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    return data as Review;
  } catch (error) {
    errorLog('Error updating review', error instanceof Error ? error : new Error(String(error)), { reviewId, updates });
    throw error;
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (
  reviewId: string,
  reviewerId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    // Verify ownership
    const { data: review } = await supabase
      .from('reviews')
      .select('user_id')
      .eq('id', reviewId)
      .single();

    if (!review || (review as any).user_id !== reviewerId) {
      throw new Error('You can only delete your own reviews');
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    return true;
  } catch (error) {
    errorLog('Error deleting review', error instanceof Error ? error : new Error(String(error)), { reviewId });
    return false;
  }
};

/**
 * Mark a review as helpful
 */
export const markReviewHelpful = async (
  reviewId: string,
  userId: string
): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    // Check if already marked helpful (would need a review_helpful table)
    // For now, just increment helpful_count
    const { error } = await supabase.rpc('increment_review_helpful', {
      p_review_id: reviewId,
    } as any);

    if (error) {
      // Fallback: direct update
      const { data: review } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

      if (review) {
        await (supabase
          .from('reviews') as any)
          .update({ helpful_count: ((review as any).helpful_count || 0) + 1 } as any)
          .eq('id', reviewId);
      }
    }

    return true;
  } catch (error) {
    errorLog('Error marking review helpful', error instanceof Error ? error : new Error(String(error)), { reviewId });
    return false;
  }
};

/**
 * Get reviews by a user
 */
export const getUserReviews = async (
  userId: string,
  options: {
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{ data: Review[]; count: number }> => {
  const { page = 0, pageSize = 10 } = options;

  if (!isSupabaseConfigured()) {
    return { data: [], count: 0 };
  }

  try {
    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        property:properties(id, title, images)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) throw error;

    return {
      data: (data || []) as Review[],
      count: count || 0,
    };
  } catch (error) {
    errorLog('Error fetching user reviews', error instanceof Error ? error : new Error(String(error)), { userId });
    return { data: [], count: 0 };
  }
};

export default {
  getPropertyReviews,
  getPropertyReviewStats,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
};


