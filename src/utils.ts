import type { ProviderOptions } from './types';

// Default log level
let currentLogLevel: 'debug' | 'info' | 'error' | 'none' = 'error';

// Log level priority (higher number = higher priority)
const logLevelPriority = {
  debug: 0,
  info: 1,
  error: 2,
  none: 3
};

export const setLogLevel = (level: 'debug' | 'info' | 'error' | 'none') => {
  currentLogLevel = level;
};

export const logger = {
  debug: (...args: any[]) => {
    if (logLevelPriority[currentLogLevel] <= logLevelPriority.debug) {
      console.log('[GCS Upload Provider Debug]:', ...args);
    }
  },
  info: (...args: any[]) => {
    if (logLevelPriority[currentLogLevel] <= logLevelPriority.info) {
      console.log('[GCS Upload Provider Info]:', ...args);
    }
  },
  error: (...args: any[]) => {
    if (logLevelPriority[currentLogLevel] <= logLevelPriority.error) {
      console.error('[GCS Upload Provider Error]:', ...args);
    }
  }
};

export const validateConfig = (config: ProviderOptions) => {
  const requiredFields = ['bucketName'] as const;
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Set log level if provided
  if (config.logLevel) {
    setLogLevel(config.logLevel);
  }
};
