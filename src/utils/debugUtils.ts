// Niumba - Debug Utilities
// Outils pour diagnostiquer les problèmes front-end

import React from 'react';
import { Text } from 'react-native';
import { logger } from '../services/loggerService';

export const logError = (error: any, context: string) => {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  logger.error(`[${context}] Error occurred`, errorObj, {
    errorMessage: error?.message,
    errorCode: error?.code,
    context,
  });
};

export const checkData = (data: any, name: string): boolean => {
  if (!data) {
    if (__DEV__) {
      logger.warn(`[${name}] Data is null or undefined`);
    }
    return false;
  }
  if (Array.isArray(data) && data.length === 0) {
    if (__DEV__) {
      logger.warn(`[${name}] Array is empty`);
    }
    return false;
  }
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    if (__DEV__) {
      logger.warn(`[${name}] Object is empty`);
    }
    return false;
  }
  return true;
};

export const logHookState = (hookName: string, state: any) => {
  if (__DEV__) {
    logger.debug(`[${hookName}] State`, {
      hasData: !!state,
      isArray: Array.isArray(state),
      length: Array.isArray(state) ? state.length : undefined,
      keys: typeof state === 'object' && !Array.isArray(state) ? Object.keys(state) : undefined,
    });
  }
};

export const safeMap = <T>(
  data: T[] | null | undefined,
  renderFn: (item: T, index: number) => React.ReactNode,
  emptyMessage?: string
): React.ReactNode => {
  if (!data || !Array.isArray(data)) {
    return emptyMessage ? React.createElement(Text, null, emptyMessage) : null;
  }
  if (data.length === 0) {
    return emptyMessage ? React.createElement(Text, null, emptyMessage) : null;
  }
  return data.map(renderFn);
};

export const safeAccess = <T>(obj: any, path: string, defaultValue: T): T => {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null) return defaultValue;
      result = result[key];
    }
    return result ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

export default {
  logError,
  checkData,
  logHookState,
  safeMap,
  safeAccess,
};

