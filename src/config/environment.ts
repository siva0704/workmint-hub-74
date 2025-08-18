// Environment configuration for WorkMint Hub
// Handles development vs production API endpoints

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws',
  uploadEndpoint: import.meta.env.VITE_UPLOAD_ENDPOINT || '/upload',

  // Authentication
  jwtSecret: import.meta.env.VITE_JWT_SECRET,
  jwtExpiresIn: import.meta.env.VITE_JWT_EXPIRES_IN || '24h',

  // File Upload
  maxFileSize: import.meta.env.VITE_MAX_FILE_SIZE || '10MB',
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf', 'csv', 'xlsx'],

  // Feature Flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API Timeouts
  apiTimeout: 30000, // 30 seconds
  uploadTimeout: 120000, // 2 minutes for file uploads
  
  // Offline Support
  offlineRetryAttempts: 3,
  offlineRetryDelay: 2000, // 2 seconds
  
  // UI Configuration
  itemsPerPage: 10,
  maxSearchResults: 50,
  
  // Mobile Configuration
  pullToRefreshEnabled: true,
  infiniteScrollEnabled: true,
} as const;

// Validate required environment variables
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
  ];

  const missing = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missing.length > 0 && config.isProduction) {
    console.warn('Missing required environment variables:', missing);
  }

  return missing.length === 0;
};

// Log current configuration in development
if (config.isDevelopment) {
  console.log('🔧 WorkMint Hub Configuration:', {
    apiBaseUrl: config.apiBaseUrl,
    wsUrl: config.wsUrl,
    environment: config.isDevelopment ? 'development' : 'production',
  });
}