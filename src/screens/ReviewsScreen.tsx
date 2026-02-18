// Niumba - Reviews/Ratings Screen
// COMPTE REQUIS pour poster un avis - Lecture publique
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { usePropertyReviews, useCreateReview } from '../hooks/useReviews';
import type { Review } from '../services/reviewService';

interface ReviewDisplay {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface ReviewsScreenProps {
  navigation: any;
  route: {
    params: {
      propertyId: string;
      propertyTitle: string;
    };
  };
}

const ReviewsScreen: React.FC<ReviewsScreenProps> = ({ navigation, route }) => {
  const { propertyId, propertyTitle } = route.params;
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isEnglish = i18n.language === 'en';

  // Hooks Supabase
  const { reviews: supabaseReviews, stats, loading: reviewsLoading, error: reviewsError, refresh } = usePropertyReviews(propertyId);
  const { create: createReview, loading: createLoading, error: createError } = useCreateReview();

  const [showAddReview, setShowAddReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  // Convert Supabase reviews to display format
  const reviews = supabaseReviews.map(review => ({
    id: review.id,
    userId: review.user_id, // Changed from reviewer_id to user_id
    userName: review.reviewer?.full_name || 'Anonymous',
    userAvatar: review.reviewer?.avatar_url || undefined,
    rating: review.rating,
    comment: review.comment || review.title || '',
    date: new Date(review.created_at).toISOString().split('T')[0],
    helpful: review.helpful_count,
  }));

  const averageRating = stats?.average_rating || (reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0);
  const ratingCounts = stats?.rating_distribution 
    ? [stats.rating_distribution[5], stats.rating_distribution[4], stats.rating_distribution[3], stats.rating_distribution[2], stats.rating_distribution[1]]
    : [5, 4, 3, 2, 1].map(rating => reviews.filter(r => r.rating === rating).length);
  
  // COMPTE REQUIS pour poster un avis
  const handleAddReview = () => {
    if (!user) {
      Alert.alert(
        isEnglish ? 'Login Required' : 'Connexion requise',
        isEnglish 
          ? 'Please sign in to leave a review.' 
          : 'Veuillez vous connecter pour laisser un avis.',
        [
          { text: isEnglish ? 'Cancel' : 'Annuler', style: 'cancel' },
          { text: isEnglish ? 'Sign In' : 'Se connecter', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    setShowAddReview(true);
  };

  const submitReview = async () => {
    if (newRating === 0 || !newComment.trim()) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        isEnglish ? 'Please provide a rating and comment' : 'Veuillez fournir une note et un commentaire'
      );
      return;
    }

    const review = await createReview(propertyId, newRating, undefined, newComment.trim());
    
    if (review) {
      setShowAddReview(false);
      setNewRating(0);
      setNewComment('');
      refresh(); // Refresh reviews list
      Alert.alert(
        isEnglish ? 'Success' : 'Succès',
        isEnglish ? 'Your review has been submitted!' : 'Votre avis a été soumis !'
      );
    } else if (createError) {
      Alert.alert(
        isEnglish ? 'Error' : 'Erreur',
        createError
      );
    }
  };

  const StarRating: React.FC<{
    rating: number;
    size?: number;
    editable?: boolean;
    onRate?: (rating: number) => void;
  }> = ({ rating, size = 16, editable = false, onRate }) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity
          key={star}
          disabled={!editable}
          onPress={() => onRate?.(star)}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={COLORS.warning}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const RatingBar: React.FC<{ stars: number; count: number; total: number }> = ({ stars, count, total }) => (
    <View style={styles.ratingBar}>
      <Text style={styles.ratingBarStars}>{stars}</Text>
      <Ionicons name="star" size={12} color={COLORS.warning} />
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${(count / total) * 100}%` }]} />
      </View>
      <Text style={styles.ratingBarCount}>{count}</Text>
    </View>
  );

  const ReviewCard: React.FC<{ review: ReviewDisplay }> = ({ review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        {review.userAvatar ? (
          <Image source={{ uri: review.userAvatar }} style={styles.reviewAvatar} />
        ) : (
          <View style={styles.reviewAvatarPlaceholder}>
            <Text style={styles.reviewAvatarText}>
              {review.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.reviewInfo}>
          <Text style={styles.reviewName}>{review.userName}</Text>
          <View style={styles.reviewMeta}>
            <StarRating rating={review.rating} size={14} />
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.reviewComment}>{review.comment}</Text>
      
      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons name="thumbs-up-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.helpfulText}>
            {isEnglish ? 'Helpful' : 'Utile'} ({review.helpful})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="flag-outline" size={16} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>{isEnglish ? 'Reviews' : 'Avis'}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{propertyTitle}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {reviewsLoading && reviews.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {isEnglish ? 'Loading reviews...' : 'Chargement des avis...'}
            </Text>
          </View>
        ) : (
          <>
            {/* Rating Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
                <StarRating rating={Math.round(averageRating)} size={20} />
                <Text style={styles.totalReviews}>
                  {stats?.total_reviews || reviews.length} {isEnglish ? 'reviews' : 'avis'}
                </Text>
              </View>
              <View style={styles.summaryRight}>
                {[5, 4, 3, 2, 1].map((stars, index) => (
                  <RatingBar 
                    key={stars} 
                    stars={stars} 
                    count={ratingCounts[index]} 
                    total={stats?.total_reviews || reviews.length} 
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {reviewsError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{reviewsError}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>
                {isEnglish ? 'Retry' : 'Réessayer'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Review Button - COMPTE REQUIS */}
        <TouchableOpacity 
          style={styles.addReviewButton}
          onPress={handleAddReview}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          <Text style={styles.addReviewText}>
            {isEnglish ? 'Write a Review' : 'Écrire un avis'}
          </Text>
        </TouchableOpacity>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <View style={styles.reviewsList}>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </View>
        ) : !reviewsLoading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>
              {isEnglish ? 'No reviews yet' : 'Aucun avis pour le moment'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isEnglish ? 'Be the first to review this property!' : 'Soyez le premier à noter cette propriété !'}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddReview(false)}>
              <Text style={styles.modalCancel}>{isEnglish ? 'Cancel' : 'Annuler'}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEnglish ? 'Write a Review' : 'Écrire un avis'}
            </Text>
            <TouchableOpacity 
              onPress={submitReview}
              disabled={!newRating || !newComment.trim() || createLoading}
            >
              {createLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={[styles.modalSubmit, (!newRating || !newComment.trim()) && styles.modalSubmitDisabled]}>
                  {isEnglish ? 'Submit' : 'Envoyer'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>
              {isEnglish ? 'Your Rating' : 'Votre note'}
            </Text>
            <View style={styles.ratingSelector}>
              <StarRating 
                rating={newRating} 
                size={40} 
                editable 
                onRate={setNewRating} 
              />
            </View>
            <Text style={styles.ratingHint}>
              {newRating === 0 ? (isEnglish ? 'Tap to rate' : 'Tapez pour noter') :
               newRating === 1 ? (isEnglish ? 'Poor' : 'Mauvais') :
               newRating === 2 ? (isEnglish ? 'Fair' : 'Passable') :
               newRating === 3 ? (isEnglish ? 'Good' : 'Bien') :
               newRating === 4 ? (isEnglish ? 'Very Good' : 'Très bien') :
               (isEnglish ? 'Excellent' : 'Excellent')}
            </Text>

            <Text style={styles.modalLabel}>
              {isEnglish ? 'Your Review' : 'Votre avis'}
            </Text>
            <TextInput
              style={styles.commentInput}
              value={newComment}
              onChangeText={setNewComment}
              placeholder={isEnglish 
                ? 'Share your experience with this property...'
                : 'Partagez votre expérience avec cette propriété...'}
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{newComment.length}/500</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.screenPadding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    flexDirection: 'row',
    margin: SIZES.screenPadding,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.card,
  },
  summaryLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  totalReviews: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  summaryRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingBarStars: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 3,
  },
  ratingBarCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 20,
    textAlign: 'right',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.screenPadding,
    padding: 14,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  addReviewText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reviewsList: {
    paddingHorizontal: SIZES.screenPadding,
    paddingTop: 16,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  reviewAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalSubmit: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  modalSubmitDisabled: {
    color: COLORS.textLight,
  },
  modalContent: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 20,
  },
  ratingSelector: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ratingHint: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  commentInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 150,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    margin: SIZES.screenPadding,
    padding: 16,
    backgroundColor: COLORS.errorLight,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ReviewsScreen;

