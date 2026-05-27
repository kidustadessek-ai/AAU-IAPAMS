import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const fixFilenames = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const applicationsCollection = db.collection('applications');
    
    const applications = await applicationsCollection.find({}).toArray();
    console.log(`Found ${applications.length} applications`);

    let updated = 0;

    for (const app of applications) {
      const updates = {};

      // Fix CV - handle string format
      if (app.documents?.cv && typeof app.documents.cv === 'string') {
        const url = app.documents.cv;
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const publicId = lastPart.split('?')[0];
        
        // Try to extract original filename or use public_id
        const filename = publicId.includes('.') ? publicId : `${publicId}.pdf`;
        
        updates['documents.cv'] = {
          url: url,
          filename: filename,
          mimetype: 'application/pdf'
        };
        console.log(`Will migrate CV for application ${app._id}: ${filename}`);
      }

      // Fix cover letter
      if (app.documents?.coverLetter && typeof app.documents.coverLetter === 'string' && app.documents.coverLetter) {
        const url = app.documents.coverLetter;
        const urlParts = url.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        const publicId = lastPart.split('?')[0];
        const filename = publicId.includes('.') ? publicId : `${publicId}.pdf`;
        
        updates['documents.coverLetter'] = {
          url: url,
          filename: filename,
          mimetype: 'application/pdf'
        };
        console.log(`Will migrate cover letter for application ${app._id}: ${filename}`);
      }

      if (Object.keys(updates).length > 0) {
        await applicationsCollection.updateOne(
          { _id: app._id },
          { $set: updates }
        );
        updated++;
        console.log(`✓ Updated application ${app._id}`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} applications`);
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

fixFilenames();
