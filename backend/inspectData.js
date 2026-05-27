import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Application from './src/models/Application.js';

dotenv.config();

const inspectData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const applications = await Application.find({}).limit(5);
    
    applications.forEach((app, index) => {
      console.log(`\n========== Application ${index + 1} (ID: ${app._id}) ==========`);
      console.log('CV:', JSON.stringify(app.documents?.cv, null, 2));
      console.log('Cover Letter:', JSON.stringify(app.documents?.coverLetter, null, 2));
      console.log('Certificates:', JSON.stringify(app.documents?.certificates, null, 2));
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

inspectData();
