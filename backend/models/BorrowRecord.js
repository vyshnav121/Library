import mongoose from 'mongoose';

const borrowRecordSchema = new mongoose.Schema(
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
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed',
    },
    fine: {
      type: Number,
      default: 0,
    },
    borrowDays: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BorrowRecord = mongoose.model('BorrowRecord', borrowRecordSchema);
export default BorrowRecord;
