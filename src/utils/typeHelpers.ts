// Niumba - Type Helpers
// Utility functions to help with TypeScript type issues

/**
 * Convert null to undefined for TypeScript compatibility
 */
export const nullToUndefined = <T>(value: T | null): T | undefined => {
  return value === null ? undefined : value;
};

/**
 * Convert undefined to null for Supabase compatibility
 */
export const undefinedToNull = <T>(value: T | undefined): T | null => {
  return value === undefined ? null : value;
};

/**
 * Type assertion helper for Supabase queries
 * Use this when TypeScript can't infer the correct type
 */
export const assertSupabaseType = <T>(value: any): T => {
  return value as T;
};

/**
 * Safe property access with default value
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = current[key];
  }
  return current !== null && current !== undefined ? current : defaultValue;
};


