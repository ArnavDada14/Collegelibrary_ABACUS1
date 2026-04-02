const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Book = require('./models/Book');
const IssuedBook = require('./models/IssuedBook');

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log('MongoDB connected successfully');
    await seedDatabase();
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

async function seedDatabase() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Book.deleteMany({});
    await IssuedBook.deleteMany({});

    // Create users
    console.log('Creating users...');
    const users = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@library.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Student One',
        email: 'student1@lib.com',
        password: 'student123',
        role: 'student',
        studentId: 'STU001'
      },
      {
        name: 'Student Two',
        email: 'student2@lib.com',
        password: 'student123',
        role: 'student',
        studentId: 'STU002'
      },
      {
        name: 'Student Three',
        email: 'student3@lib.com',
        password: 'student123',
        role: 'student',
        studentId: 'STU003'
      }
    ]);

    console.log(`${users.length} users created successfully`);

    // Create books
    console.log('Creating books...');
    const booksData = [
      {
        title: 'Introduction to Physics',
        author: 'Stephen Hawking',
        isbn: 'ISBN001',
        category: 'Science',
        totalCopies: 5,
        availableCopies: 5,
        description: 'A comprehensive introduction to the fundamentals of physics',
        coverImage: 'https://i.pinimg.com/474x/bc/ac/29/bcac297cd4779286facd1581bab3d6ed.jpg'
      },
      {
        title: 'The Big Bang Theory',
        author: 'Roger Penrose',
        isbn: 'ISBN002',
        category: 'Science',
        totalCopies: 3,
        availableCopies: 3,
        description: 'Understanding the origin of the universe',
        coverImage: 'https://i.pinimg.com/474x/10/b3/62/10b362b2b2ba94cf6f8adc4a784d6fb3.jpg'
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: 'ISBN003',
        category: 'Science',
        totalCopies: 4,
        availableCopies: 4,
        description: 'From the Big Bang to Black Holes',
        coverImage: 'https://m.media-amazon.com/images/I/71HebRZ4npL._AC_UF350,350_QL50_.jpg'
      },
      {
        title: 'The History of Ancient Rome',
        author: 'Edward Gibbon',
        isbn: 'ISBN004',
        category: 'History',
        totalCopies: 3,
        availableCopies: 3,
        description: 'A comprehensive history of the Roman Empire',
        coverImage: 'https://m.media-amazon.com/images/I/71oanOUzVYL._AC_UF1000,1000_QL80_.jpg'
      },
      {
        title: 'World War II: The Complete History',
        author: 'Martin Gilbert',
        isbn: 'ISBN005',
        category: 'History',
        totalCopies: 4,
        availableCopies: 4,
        description: 'The definitive account of the Second World War',
        coverImage: 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1347785356i/4496786.jpg'
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: 'ISBN006',
        category: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
        description: 'A gripping tale of race, justice, and morality',
        coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/960px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg'
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: 'ISBN007',
        category: 'Fiction',
        totalCopies: 4,
        availableCopies: 4,
        description: 'A timeless romance of manners and marriage',
        coverImage: 'https://i.pinimg.com/474x/a4/61/5c/a4615c072f533db569025ddc21571aeb.jpg'
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: 'ISBN008',
        category: 'Fiction',
        totalCopies: 3,
        availableCopies: 3,
        description: 'The American Dream in the Jazz Age',
        coverImage: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg'
      },
      {
        title: 'Introduction to Artificial Intelligence',
        author: 'Stuart Russell',
        isbn: 'ISBN009',
        category: 'Technology',
        totalCopies: 4,
        availableCopies: 4,
        description: 'A modern approach to AI and machine learning',
        coverImage: 'https://images-platform.99static.com/bievWj_FyrmHXI_Ayfqs5ZvKfHo=/133x133:1200x1200/500x500/top/smart/99designs-contests-attachments/152/152936/attachment_152936367'
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas',
        isbn: 'ISBN010',
        category: 'Technology',
        totalCopies: 3,
        availableCopies: 3,
        description: 'Your Journey to Mastery in Software Development',
        coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiVyeXr4vKD3z8RJbhbrcL51i1FCk-AiEVk42sJnYBnrFNApazRec6tgAI26aNrZJDQhQWgN9vQpisxi8Z8-5dzPi7IlHK2SdTHQ6f2PCEgQFAjhjdR8t2d0lmUFCEmzjSJqJhxykn7LsY/w1200-h630-p-k-no-nu/The_pragmatic_programmer.jpg'
      }
    ];

    const books = await Book.insertMany(booksData);
    console.log(`${books.length} books created successfully`);

    console.log('\n=== Seed Database Complete ===');
    console.log('Users created:');
    console.log('  - admin@library.com / admin123 (admin)');
    console.log('  - student1@lib.com / student123 (student, STU001)');
    console.log('  - student2@lib.com / student123 (student, STU002)');
    console.log('  - student3@lib.com / student123 (student, STU003)');
    console.log('\nBooks created: 10 books across different categories');
    console.log('==========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}
