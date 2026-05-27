import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Application from './src/models/Application.js';

dotenv.config();

const migrateApplicationDocuments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const applications = await Application.find({});
    console.log(`📄 Found ${applications.length} applications to migrate`);

    let migrated = 0;
    let skipped = 0;

    for (const app of applications) {
      try {
        // Check if already migrated (has url property)
        if (app.documents.cv && typeof app.documents.cv === 'object' && app.documents.cv.url) {
          skipped++;
          continue;
        }

        // Migrate CV
        if (typeof app.documents.cv === 'string') {
          const cvUrl = app.documents.cv;
          const cvFilename = cvUrl.split('/').pop().split('?')[0] || 'cv.pdf';
          app.documents.cv = {
            url: cvUrl,
            filename: cvFilename.includes('.') ? cvFilename : `${cvFilename}.pdf`,
            mimetype: 'application/pdf',
          };
        }

        // Migrate Cover Letter
        if (typeof app.documents.coverLetter === 'string') {
          if (app.documents.coverLetter) {
            const clUrl = app.documents.coverLetter;
            const clFilename = clUrl.split('/').pop().split('?')[0] || 'cover_letter.pdf';
            app.documents.coverLetter = {
              url: clUrl,
              filename: clFilename.includes('.') ? clFilename : `${clFilename}.pdf`,
              mimetype: 'application/pdf',
            };
          } else {
            app.documents.coverLetter = { url: '', filename: '', mimetype: '' };
          }
        }

        // Migrate Certificates
        if (Array.isArray(app.documents.certificates)) {
          app.documents.certificates = app.documents.certificates.map((cert, index) => {
            if (typeof cert === 'string') {
              const certFilename = cert.split('/').pop().split('?')[0] || `certificate_${index + 1}.pdf`;
              return {
                url: cert,
                filename: certFilename.includes('.') ? certFilename : `${certFilename}.pdf`,
                mimetype: 'application/pdf',
              };
            }
            return cert;
          });
        }

        await app.save();
        migrated++;
        console.log(`✅ Migrated application ${app._id}`);
      } catch (error) {
        console.error(`❌ Failed to migrate application ${app._id}:`, error.message);
      }
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${applications.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateApplicationDocuments();
