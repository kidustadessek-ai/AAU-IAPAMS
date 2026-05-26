import mongoose from 'mongoose';

const evaluationSchema = new mongoose.Schema({
  evaluator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scores: {
    experience: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    education: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    skills: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
  },
  comments: {
    type: String,
    default: '',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documents: {
      cv: {
        type: String,
        required: [true, 'CV is required'],
      },
      coverLetter: {
        type: String,
        default: '',
      },
      certificates: {
        type: [String],
        default: [],
      },
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'shortlisted', 'approved', 'rejected', 'accepted', 'interview_scheduled'],
      default: 'pending',
    },
    interview: {
      date: { type: String },
      time: { type: String },
      location: { type: String },
      scheduledAt: { type: Date },
    },
    evaluations: [evaluationSchema],
    averageScore: {
      type: Number,
      default: 0,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ position: 1, applicant: 1 }, { unique: true });

// Calculate average score from evaluations
applicationSchema.methods.calculateAverageScore = function () {
  if (this.evaluations.length === 0) {
    this.averageScore = 0;
    return 0;
  }

  const totalScore = this.evaluations.reduce((sum, evaluation) => {
    const evalAvg = (
      evaluation.scores.experience +
      evaluation.scores.education +
      evaluation.scores.skills
    ) / 3;
    return sum + evalAvg;
  }, 0);

  this.averageScore = totalScore / this.evaluations.length;
  return this.averageScore;
};

// Auto-update status based on average score
applicationSchema.methods.updateStatusByScore = function () {
  if (this.averageScore >= 7) {
    this.status = 'shortlisted';
  } else if (this.averageScore >= 4) {
    this.status = 'under_review';
  } else if (this.averageScore > 0) {
    this.status = 'rejected';
  }
};

// Pre-save hook to calculate average score
applicationSchema.pre('save', function (next) {
  if (this.isModified('evaluations')) {
    this.calculateAverageScore();
    this.updateStatusByScore();
  }
  next();
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;
