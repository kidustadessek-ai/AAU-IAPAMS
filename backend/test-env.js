import dotenv from 'dotenv';
import { validateEnv } from './src/utils/validateEnv.js';

dotenv.config();

console.log('Testing environment validation...\n');

try {
  validateEnv();
  console.log('✅ Validation passed!\n');
  console.log('Environment check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('- PORT:', process.env.PORT || 'not set');
  console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
  console.log('- JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '✅ Set' : '❌ Missing');
  console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '⚠️  Not set (optional)');
  console.log('\nServer should be able to start now!');
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
}
