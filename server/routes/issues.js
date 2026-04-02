const express = require('express');
const IssuedBook = require('../models/IssuedBook');
const Book = require('../models/Book');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST issue book
router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookId, studentId } = req.body;
    
    // Determine userId - if studentId provided and requester is admin, use studentId
    let userId = req.user.id;
    if (studentId && req.user.role === 'admin') {
      userId = studentId;
    }

    // Check if book exists and has available copies
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    // Create issued book record
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    const issuedBook = new IssuedBook({
      userId,
      bookId,
      dueDate,
      status: 'issued'
    });

    await issuedBook.save();

    // Update book available copies
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json({
      message: 'Book issued successfully',
      issuedBook: await issuedBook.populate(['bookId', 'userId'])
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET issued books
router.get('/', verifyToken, async (req, res) => {
  try {
    let filter = {};

    // If not admin, show only user's issued books
    if (req.user.role !== 'admin') {
      filter.userId = req.user.id;
    }

    const issuedBooks = await IssuedBook.find(filter)
      .populate('userId', 'name email studentId')
      .populate('bookId', 'title author isbn category');

    res.json({
      message: 'Issues retrieved successfully',
      issues: issuedBooks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT return book
router.put('/:id/return', verifyToken, async (req, res) => {
  try {
    const issuedBook = await IssuedBook.findById(req.params.id);

    if (!issuedBook) {
      return res.status(404).json({ message: 'Issued book record not found' });
    }

    // Check if user is authorized (own record or admin)
    if (req.user.role !== 'admin' && issuedBook.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update return details
    issuedBook.returnDate = new Date();

    // Calculate fine if overdue
    if (issuedBook.returnDate > issuedBook.dueDate) {
      const daysOverdue = Math.floor(
        (issuedBook.returnDate - issuedBook.dueDate) / (1000 * 60 * 60 * 24)
      );
      issuedBook.fineAmount = daysOverdue * 2; // ₹2 per day
      issuedBook.status = 'overdue';
    } else {
      issuedBook.status = 'returned';
    }

    await issuedBook.save();

    // Update book available copies
    const book = await Book.findById(issuedBook.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json({
      message: 'Book returned successfully',
      issuedBook: await issuedBook.populate('bookId')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET overdue books (admin only)
router.get('/overdue', verifyToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();

    const overdueBooks = await IssuedBook.find({
      status: { $in: ['issued', 'overdue'] },
      dueDate: { $lt: today }
    })
      .populate('userId', 'name email studentId')
      .populate('bookId', 'title author isbn');

    res.json({
      message: 'Overdue books retrieved successfully',
      issues: overdueBooks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
