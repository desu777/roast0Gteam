import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { compilationRouter } from './routes/compilation';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3999;

// Security middleware
app.use(helmet());

// CORS configuration - allow frontend connection
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3998',
    'http://localhost:3998',
    'http://localhost:5173', // Keep for local development
    'https://deployer.desu0g.xyz', // Production frontend domain
    'https://compiler.desu0g.xyz', // Compiler domain (if needed)
    'http://deployer.desu0g.xyz', // HTTP fallback
    'http://compiler.desu0g.xyz' // HTTP fallback
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: '0G Contract Compiler'
  });
});

// API routes
app.use('/api/compile', compilationRouter);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 0G Contract Compiler running on port ${PORT}`);
  logger.info(`📡 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔧 Compilation API: http://localhost:${PORT}/api/compile`);
}); 