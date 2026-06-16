import mongoose from 'mongoose';

const fineRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    borrowRecord: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'BorrowRecord',
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const FineRecord = mongoose.model('FineRecord', fineRecordSchema);
export default FineRecord;
