// Niumba - Services Index
// Export all scalability and optimization services

// Image Optimization
export {
  default as imageOptimization,
  optimizeImage,
  optimizeWithPreset,
  generateImageSet,
  batchOptimize,
  getAdaptiveQuality,
  getOptimizedUrl,
  preloadImages,
  clearImageCache,
  getImageCacheSize,
  IMAGE_PRESETS,
} from './imageOptimizationService';

// Cache Service
export {
  default as cache,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheGetOrSet,
  cacheClear,
  CACHE_TTL,
} from './cacheService';

// Query Service (Optimized Supabase queries)
export {
  default as queryService,
  getProperties,
  getPropertyById,
  getPropertyBatched,
  searchProperties,
  getNearbyProperties,
  getProfileById,
  getProfileBatched,
  invalidatePropertyCache,
  invalidateProfileCache,
  invalidateAppointmentCache,
} from './queryService';

// Queue Service (Background tasks)
export {
  default as queue,
  TaskPriority,
  TaskStatus,
  type Task,
} from './queueService';

// Prefetch Service (Intelligent preloading)
export {
  default as prefetch,
  PrefetchPriority,
} from './prefetchService';

// Analytics Service
export {
  default as analytics,
  trackEvent,
  trackScreen,
  trackPropertyView,
  trackError,
  startMeasure,
  endMeasure,
} from './analyticsService';

// Notification Service
export * from './notificationService';

// Image Service
export * from './imageService';

// HubSpot CRM Integration
export {
  default as hubspot,
  configureHubSpot,
  isHubSpotConfigured,
  trackPropertyInquiry,
  trackAppointment,
  trackUserRegistration,
} from './hubspotService';

// Chat Service
export {
  default as chatService,
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  subscribeToConversations,
  deleteMessage,
  uploadChatAttachment,
  type Message,
  type Conversation,
} from './chatService';

// Review Service
export {
  default as reviewService,
  getPropertyReviews,
  getPropertyReviewStats,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getUserReviews,
  type Review,
  type ReviewStats,
} from './reviewService';

// Inquiry Service
export {
  default as inquiryService,
  createInquiry,
  getPropertyInquiries,
  getUserInquiries,
  getOwnerInquiries,
  updateInquiryStatus,
  respondToInquiry,
  deleteInquiry,
  type Inquiry,
} from './inquiryService';

// Appointment Service
export {
  default as appointmentService,
  createAppointment,
  getUserAppointments,
  getAvailableSlots,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
  type Appointment,
} from './appointmentService';

