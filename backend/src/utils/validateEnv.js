const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_RESET_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FRONTEND_URL'
];

const optionalEnvVars = [
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'EMAIL_FROM'
];

export const validateEnv = () => {
  const missing = [];
  const warnings = [];
  const emailMissing = [];

  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      emailMissing.push(varName);
    }
  });

  if (emailMissing.length > 0) {
    warnings.push('Email configuration is incomplete. Password reset functionality will not work.');
  }

  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.includes('change-this')) {
    warnings.push('JWT_ACCESS_SECRET appears to be using default value. Please change it!');
  }

  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.includes('change-this')) {
    warnings.push('JWT_REFRESH_SECRET appears to be using default value. Please change it!');
  }

  if (process.env.JWT_RESET_SECRET && process.env.JWT_RESET_SECRET.includes('change-this')) {
    warnings.push('JWT_RESET_SECRET appears to be using default value. Please change it!');
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment variable warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
    console.warn('\n');
  }

  console.log('✅ Environment variables validated successfully\n');
};
