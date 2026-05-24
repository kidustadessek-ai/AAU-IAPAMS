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
      username: 'evaluator1',
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

    // Create positions
    const position1 = await Position.create({
      title: 'Assistant Professor - Computer Science',
      description: 'We are seeking a qualified Assistant Professor to join our Computer Science department. The ideal candidate should have a PhD in Computer Science or related field with research experience in AI/ML.',
      college: 'College of Natural and Computational Sciences',
      department: 'Computer Science',
      positionType: 'Full-Time',
      requirements: [
        'PhD in Computer Science or related field',
        'Minimum 3 years teaching experience',
        'Published research papers in reputable journals',
        'Strong programming skills',
        'Excellent communication skills',
      ],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'open',
      numberOfPositions: 2,
      createdBy: admin._id,
      evaluators: [evaluator1._id, evaluator2._id],
    });

    const position2 = await Position.create({
      title: 'Lecturer - Management',
      description: 'The Department of Management is looking for a dedicated Lecturer with expertise in organizational behavior and strategic management.',
      college: 'College of Business and Economics',
      department: 'Department of Management',
      positionType: 'Full-Time',
      requirements: [
        'Masters degree in Management or Business Administration',
        'Minimum 2 years industry experience',
        'Experience with case study teaching methods',
        'Knowledge of contemporary management practices',
      ],
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      status: 'open',
      numberOfPositions: 1,
      createdBy: admin._id,
      evaluators: [evaluator2._id],
    });

    const position3 = await Position.create({
      title: 'Research Assistant - Public Health',
      description: 'Join our research team as a Research Assistant focusing on public health and epidemiology projects.',
      college: 'College of Health Sciences',
      department: 'School of Public Health',
      positionType: 'Part-Time',
      requirements: [
        'Bachelors degree in Public Health or related field',
        'Strong analytical skills',
        'Experience with statistical software (SPSS, R)',
        'Knowledge of research methodologies',
      ],
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
      status: 'open',
      numberOfPositions: 3,
      createdBy: admin._id,
      evaluators: [evaluator1._id],
    });
    console.log('✅ Positions created');

    // Create sample applications
    const application1 = await Application.create({
      position: position1._id,
      applicant: staff1._id,
      documents: {
        cv: 'https://res.cloudinary.com/demo/sample-cv.pdf',
        coverLetter: 'https://res.cloudinary.com/demo/sample-cover-letter.pdf',
        certificates: ['https://res.cloudinary.com/demo/sample-cert1.pdf'],
      },
      status: 'under_review',
      evaluations: [
        {
          evaluator: evaluator1._id,
          scores: {
            experience: 8,
            education: 9,
            skills: 8,
          },
          comments: 'Strong candidate with excellent qualifications.',
        },
      ],
    });

    const application2 = await Application.create({
      position: position2._id,
      applicant: staff2._id,
      documents: {
        cv: 'https://res.cloudinary.com/demo/sample-cv2.pdf',
        coverLetter: 'https://res.cloudinary.com/demo/sample-cover-letter2.pdf',
      },
      status: 'pending',
    });

    const application3 = await Application.create({
      position: position3._id,
      applicant: staff3._id,
      documents: {
        cv: 'https://res.cloudinary.com/demo/sample-cv3.pdf',
      },
      status: 'shortlisted',
      evaluations: [
        {
          evaluator: evaluator1._id,
          scores: {
            experience: 7,
            education: 8,
            skills: 9,
          },
          comments: 'Good technical skills, suitable for the position.',
        },
      ],
    });
    console.log('✅ Sample applications created');

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
