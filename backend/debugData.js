import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const debug = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const applications = await db.collection('applications').find({}).toArray();
    
    applications.forEach((app, index) => {
      console.log(`\n========== Application ${index + 1} ==========`);
      console.log('CV type:', typeof app.documents?.cv);
      console.log('CV value:', app.documents?.cv);
      console.log('CV is string?', typeof app.documents?.cv === 'string');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debug();
