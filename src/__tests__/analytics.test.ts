// Niumba - Analytics Tests
import { analytics, AnalyticsEvent } from '../services/analyticsService';

describe('Analytics Service', () => {
  beforeEach(() => {
    analytics.clearEvents();
    analytics.setEnabled(true);
  });

  describe('Event Logging', () => {
    it('should log an event', () => {
      analytics.logEvent('property_view', { property_id: '123' });
      const events = analytics.getPendingEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('property_view');
      expect(events[0].properties.property_id).toBe('123');
    });

    it('should not log events when disabled', () => {
      analytics.setEnabled(false);
      analytics.logEvent('property_view');
      const events = analytics.getPendingEvents();
      expect(events).toHaveLength(0);
    });
  });

  describe('Screen View Logging', () => {
    it('should log screen view', () => {
      analytics.logScreenView('HomeScreen');
      const events = analytics.getPendingEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('screen_view');
      expect(events[0].properties.screen_name).toBe('HomeScreen');
    });
  });

  describe('Error Logging', () => {
    it('should log error with message', () => {
      analytics.logError('Test error');
      const events = analytics.getPendingEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('error_occurred');
      expect(events[0].properties.error_message).toBe('Test error');
    });

    it('should log error with Error object', () => {
      const error = new Error('Test error');
      analytics.logError(error);
      const events = analytics.getPendingEvents();
      expect(events).toHaveLength(1);
      expect(events[0].properties.error_message).toBe('Test error');
      expect(events[0].properties.error_stack).toBeDefined();
    });
  });

  describe('Search Logging', () => {
    it('should log search with query and results', () => {
      analytics.logSearch('apartment', 10);
      const events = analytics.getPendingEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('search_performed');
      expect(events[0].properties.query).toBe('apartment');
      expect(events[0].properties.results_count).toBe(10);
    });
  });

  describe('Property View Logging', () => {
    it('should log property view', () => {
      analytics.logPropertyView('prop123', 'apartment', 100000);
      const events = analytics.getPendingEvents();
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe('property_view');
      expect(events[0].properties.property_id).toBe('prop123');
      expect(events[0].properties.property_type).toBe('apartment');
      expect(events[0].properties.price).toBe(100000);
    });
  });

  describe('Event Buffer', () => {
    it('should limit buffer size to 1000 events', () => {
      for (let i = 0; i < 1500; i++) {
        analytics.logEvent('property_view', { index: i });
      }
      const events = analytics.getPendingEvents();
      expect(events.length).toBeLessThanOrEqual(1000);
    });
  });
});


