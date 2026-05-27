import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Position from '../models/Position.js';
import Application from '../models/Application.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Position.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@aau.edu.et',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      fullName: 'System Administrator',
      role: 'admin',
      department: 'IT Department',
      phone: '+251911234567',
      status: 'active',
    });
    console.log('✅ Admin user created');

    // Create evaluators
    const evaluator1 = await User.create({
      username: 'kidus',
      email: 'evaluator1@aau.edu.et',
      password: 'Evaluator@123',
      fullName: 'Dr. Abebe Kebede',
      role: 'evaluator',
      department: 'Computer Science',
      phone: '+251911234568',
      status: 'active',
    });

    const evaluator2 = await User.create({
      username: 'evaluator2',
      email: 'evaluator2@aau.edu.et',
      password: 'Evaluator@123',
      fullName: 'Dr. Tigist Haile',
      role: 'evaluator',
      department: 'Software Engineering',
      phone: '+251911234569',
      status: 'active',
    });
    console.log('✅ Evaluators created');

    // Create staff users
    const staff1 = await User.create({
      username: 'staff1',
      email: 'staff1@aau.edu.et',
      password: 'Staff@123',
      fullName: 'Yohannes Tadesse',
      role: 'staff',
      department: 'Computer Science',
      phone: '+251911234570',
      status: 'active',
    });

    const staff2 = await User.create({
      username: 'staff2',
      email: 'staff2@aau.edu.et',
      password: 'Staff@123',
      fullName: 'Meron Alemayehu',
      role: 'staff',
      department: 'Software Engineering',
      phone: '+251911234571',
      status: 'active',
    });

    const staff3 = await User.create({
      username: 'staff3',
      email: 'staff3@aau.edu.et',
      password: 'Staff@123',
      fullName: 'Dawit Bekele',
      role: 'staff',
      department: 'Information Systems',
      phone: '+251911234572',
      status: 'active',
    });
    console.log('✅ Staff users created');

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📋 Created accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\nEvaluators:');
    console.log(`  Username: evaluator1 | Password: Evaluator@123`);
    console.log(`  Username: evaluator2 | Password: Evaluator@123`);
    console.log('\nStaff:');
    console.log(`  Username: staff1 | Password: Staff@123`);
    console.log(`  Username: staff2 | Password: Staff@123`);
    console.log(`  Username: staff3 | Password: Staff@123`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(seedDatabase);
