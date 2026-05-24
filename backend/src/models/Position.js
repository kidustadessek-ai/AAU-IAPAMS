import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Position title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Position description is required'],
    },
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    positionType: {
      type: String,
      required: [true, 'Position type is required'],
      enum: ['Full-Time', 'Part-Time', 'Contract', 'Temporary'],
      default: 'Full-Time',
    },
    requirements: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'filled'],
      default: 'open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    evaluators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    numberOfPositions: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
positionSchema.index({ status: 1, deadline: 1 });
positionSchema.index({ college: 1, department: 1 });

// Auto-close positions after deadline
positionSchema.methods.checkDeadline = function () {
  if (this.deadline < new Date() && this.status === 'open') {
    this.status = 'closed';
    return true;
  }
  return false;
};

const Position = mongoose.model('Position', positionSchema);

export default Position;
