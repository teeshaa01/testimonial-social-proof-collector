const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
      maxlength: [80, 'Space name cannot exceed 80 characters']
    },
    slug: {
      type: String,
      required: [true, 'Space slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    brandLogo: {
      type: String,
      default: ''
    },
    headerTitle: {
      type: String,
      default: 'Share your experience with us'
    },
    customMessage: {
      type: String,
      default: 'Your feedback helps us continuously improve and helps others make informed choices.'
    },
    customPrompts: {
      type: [String],
      default: [
        'Who are you and what do you do?',
        'What specific problem did our product or service solve for you?',
        'What is your favorite feature or benefit?',
        'Would you recommend us to colleagues or friends?'
      ]
    },
    mandatoryAvatarToggle: {
      type: Boolean,
      default: false
    },
    starRatingToggle: {
      type: Boolean,
      default: true
    },
    customQuestions: [
      {
        id: { type: String },
        label: { type: String },
        placeholder: { type: String }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Space', spaceSchema);
