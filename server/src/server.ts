import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { connectDatabase } from './config/database';
import { config, validateEnvironment } from './config/environment';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { securityHeaders, apiRateLimit, corsOptions } from './middleware/security';

// Validate environment variables
validateEnvironment();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(apiRateLimit);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync(config.upload.uploadDir)) {
  fs.mkdirSync(config.upload.uploadDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(config.upload.uploadDir));

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'WorkMint Hub Backend is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    app.listen(config.server.port, '0.0.0.0', () => {
      console.log(`🚀 WorkMint Hub Backend running on port ${config.server.port}`);
      console.log(`📊 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 CORS Origin: ${config.server.corsOrigin}`);
      console.log(`📁 Upload Directory: ${config.upload.uploadDir}`);
      console.log(`🔗 API Base URL: http://localhost:${config.server.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();