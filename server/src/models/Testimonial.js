const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Space',
      required: true,
      index: true
    },
    clientName: {
      type: String,
      required: [true, 'Your name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Your email is required'],
      lowercase: true,
      trim: true
    },
    companyRole: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Company/Role cannot exceed 100 characters']
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    reviewText: {
      type: String,
      required: [true, 'Review message is required'],
      trim: true,
      minlength: [5, 'Review must be at least 5 characters long'],
      maxlength: [2000, 'Review cannot exceed 2000 characters']
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'archived'],
      default: 'pending',
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isLiked: {
      type: Boolean,
      default: false
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
