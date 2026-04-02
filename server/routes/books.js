const express = require('express');
const Book = require('../models/Book');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET all books with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, available } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (available === 'true') {
      filter.availableCopies = { $gt: 0 };
    }

    const books = await Book.find(filter);
    res.json({
      message: 'Books retrieved successfully',
      books: books
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create book (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies, description, coverImage } = req.body;

    // Validate input
    if (!title || !author || !isbn || !totalCopies) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = new Book({
      title,
      author,
      isbn,
      category,
      totalCopies,
      availableCopies: totalCopies,
      description,
      coverImage: coverImage || `https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj2c_aaAcRO_EuMUVx_eg2feIC2RwBjNy5t-3x88xOCqyJ51ZxyjPWLQPCiDFdjx9TaI4Z_1LGUkNlVFqgaDkxxAsZA2Ra69_WxH5StjdmKmsbj0KxKsLXokSLEN1fU5mSwuzsO9cW59g8vELWqyo4w44NkLa1j4uvSNyDLwQC4J_sFTcS4Iz2Ksvq-/w200-h200/TYCD%20images.png`
    });

    await book.save();
    res.status(201).json({ message: 'Book created successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update book (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, author, category, totalCopies, availableCopies, description, coverImage } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        category,
        totalCopies,
        availableCopies,
        description,
        coverImage
      },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE book (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
