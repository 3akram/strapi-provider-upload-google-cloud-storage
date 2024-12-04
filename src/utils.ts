export const logger = {
  debug: (...args: any[]) => {
    console.log('[GCS Upload Provider Debug]:', ...args);
  },
  info: (...args: any[]) => {
    console.log('[GCS Upload Provider Info]:', ...args);
  },
  error: (...args: any[]) => {
    console.error('[GCS Upload Provider Error]:', ...args);
  }
};

export const validateConfig = (config: Record<string, any>) => {
  const requiredFields = ['bucketName'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};
