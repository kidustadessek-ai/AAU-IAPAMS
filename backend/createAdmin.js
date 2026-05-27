import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      username: 'admin',
      email: 'admin@aau.edu.et',
      password: 'Admin@123',
      fullName: 'System Administrator',
      role: 'admin',
      department: 'IT Department',
      phone: '+251911234567',
      status: 'active',
    });

    console.log('✅ Admin created successfully!');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
