// Niumba - Supabase Error Handler Utility
// Handles common Supabase errors gracefully

export interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

/**
 * Check if error is a "table not found" error
 */
export const isTableNotFoundError = (error: any): boolean => {
  if (!error) return false;
  const errorCode = error.code || '';
  const errorMessage = error.message || '';
  
  return (
    errorCode === 'PGRST205' ||
    errorMessage.includes('Could not find the table') ||
    errorMessage.includes('relation') && errorMessage.includes('does not exist')
  );
};

/**
 * Handle Supabase errors gracefully
 * Returns true if error was handled (table not found), false otherwise
 */
export const handleSupabaseError = (error: any, tableName?: string): boolean => {
  if (!error) return false;

  if (isTableNotFoundError(error)) {
    console.warn(
      `Table not found in Supabase${tableName ? `: ${tableName}` : ''}. ` +
      `Please create the table or configure Supabase.`
    );
    return true; // Error was handled
  }

  // Log other errors but don't handle them
  console.error('Supabase error:', error);
  return false; // Error was not handled
};

/**
 * Safe Supabase query wrapper
 * Returns null if table not found, throws otherwise
 */
export const safeSupabaseQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  tableName?: string
): Promise<T | null> => {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      if (handleSupabaseError(error, tableName)) {
        return null; // Table not found, return null gracefully
      }
      throw error; // Other errors should be thrown
    }
    
    return data;
  } catch (error) {
    if (isTableNotFoundError(error)) {
      return null;
    }
    throw error;
  }
};

export default {
  isTableNotFoundError,
  handleSupabaseError,
  safeSupabaseQuery,
};


