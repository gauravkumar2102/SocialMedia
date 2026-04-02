const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 }
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      maxlength: [1000, 'Post text cannot exceed 1000 characters'],
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    likes: {
      type: [String],
      default: []
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
    },
    comments: {
      type: [commentSchema],
      default: []
    }
  },
  { timestamps: true }
);

// Ensure at least text or image is provided
postSchema.pre('save', function (next) {
  if (!this.text && !this.image) {
    return next(new Error('Post must have either text or an image'));
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
