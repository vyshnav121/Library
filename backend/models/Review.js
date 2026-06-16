import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Book',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting multiple reviews for the same book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
