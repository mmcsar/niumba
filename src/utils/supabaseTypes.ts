// Niumba - Supabase Type Helpers
// Helper functions to fix TypeScript type issues with Supabase

import { Database } from '../types/database';

/**
 * Type helper to get table row type
 */
export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

/**
 * Type helper to get table insert type
 */
export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

/**
 * Type helper to get table update type
 */
export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

/**
 * Assert that a value is a table row type
 * Use this to fix TypeScript 'never' type issues
 */
export function assertTableRow<T extends keyof Database['public']['Tables']>(
  value: any
): TableRow<T> {
  return value as TableRow<T>;
}

/**
 * Assert that an array is a table row array
 */
export function assertTableRowArray<T extends keyof Database['public']['Tables']>(
  value: any[]
): TableRow<T>[] {
  return value as TableRow<T>[];
}


