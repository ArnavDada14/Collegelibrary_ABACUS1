const mongoose = require('mongoose');

const issuedBookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue'],
      default: 'issued'
    },
    fineAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Virtual method to calculate fine
issuedBookSchema.virtual('getFine').get(function () {
  if (this.returnDate) {
    // Book has been returned
    return 0;
  }

  const today = new Date();
  if (today > this.dueDate) {
    // Calculate days overdue
    const daysOverdue = Math.floor(
      (today - this.dueDate) / (1000 * 60 * 60 * 24)
    );
    // ₹2 per day
    return daysOverdue * 2;
  }

  return 0;
});

module.exports = mongoose.model('IssuedBook', issuedBookSchema);
