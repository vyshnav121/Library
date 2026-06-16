import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String, // URL to image
    },
    totalCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    location: {
      type: String, // e.g., "Aisle 3, Shelf 2"
    },
    publishedYear: {
      type: Number,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    pricePerDay: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['available', 'issued', 'reserved', 'lost', 'maintenance'],
      default: 'available',
    },
    pdfUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model('Book', bookSchema);
export default Book;
