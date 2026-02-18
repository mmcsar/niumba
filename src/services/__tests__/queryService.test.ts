// Niumba - Query Service Tests
import { supabase } from '../../lib/supabase';
import { getPropertyById, getProperties, searchProperties } from '../queryService';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  },
}));

describe('QueryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPropertyById', () => {
    it('should fetch a property by ID', async () => {
      const mockProperty = {
        id: '123',
        title: 'Test Property',
        price: 100000,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProperty, error: null })),
          })),
        })),
      });

      const property = await getPropertyById('123');

      expect(property).toEqual(mockProperty);
      expect(supabase.from).toHaveBeenCalledWith('properties');
    });

    it('should return null if property not found', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
          })),
        })),
      });

      const property = await getPropertyById('non-existent');

      expect(property).toBeNull();
    });
  });

  describe('getProperties', () => {
    it('should fetch properties with default options', async () => {
      const mockProperties = [
        { id: '1', title: 'Property 1' },
        { id: '2', title: 'Property 2' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: mockProperties, error: null })),
            })),
          })),
        })),
      });

      const properties = await getProperties({});

      expect(properties).toEqual(mockProperties);
    });
  });

  describe('searchProperties', () => {
    it('should search properties with filters', async () => {
      const mockResults = { data: [{ id: '1', title: 'Matching Property' }], count: 1 };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(() => ({
              range: jest.fn(() => ({
                order: jest.fn(() => Promise.resolve({ data: mockResults.data, error: null, count: mockResults.count })),
              })),
            })),
          })),
        })),
      });

      const results = await searchProperties('test', {
        filters: {
          city: 'Lubumbashi',
          type: 'house',
        },
      });

      expect(results.data).toEqual(mockResults.data);
      expect(results.count).toBe(mockResults.count);
    });
  });
});

