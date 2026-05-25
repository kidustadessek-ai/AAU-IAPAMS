import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/database.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import { validateEnv } from './src/utils/validateEnv.js';
import { logger } from './src/utils/logger.js';
import { 
  DEFAULT_PORT, 
  RATE_LIMIT_WINDOW_MS, 
  RATE_LIMIT_MAX_REQUESTS_DEV, 
  RATE_LIMIT_MAX_REQUESTS_PROD 
} from './src/constants/index.js';

import authRoutes from './src/routes/authRoutes.js';
import positionRoutes from './src/routes/positionRoutes.js';
import applicationRoutes from './src/routes/applicationRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();
validateEnv();

const app = express();

connectDB();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: process.env.NODE_ENV === 'development' ? RATE_LIMIT_MAX_REQUESTS_DEV : RATE_LIMIT_MAX_REQUESTS_PROD,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public folder
app.use('/public', express.static('public'));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AAU IAPAMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    logoUrl: `${req.protocol}://${req.get('host')}/public/aau.png`
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || DEFAULT_PORT;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎓 AAU IAPAMS API Server                                ║
║                                                           ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(43)}║
║   Port: ${PORT.toString().padEnd(51)}║
║   URL: http://localhost:${PORT.toString().padEnd(35)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  process.exit(1);
});
