import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Book from '../models/Book.js';
import User from '../models/User.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Verify all existing users
    const verifyResult = await User.updateMany({}, { isVerified: true });
    console.log(`Verified ${verifyResult.modifiedCount} users.`);

    // 2. Clear old books and categories
    await Book.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing books and categories.');

    // 3. Create Categories
    const tech = await Category.create({ name: 'Technology', description: 'Computing, programming and software engineering.' });
    const fiction = await Category.create({ name: 'Fiction', description: 'Novels, drama and literature.' });
    const science = await Category.create({ name: 'Science', description: 'Physics, chemistry, biology and general sciences.' });
    const history = await Category.create({ name: 'History', description: 'Ancient history, biographies and historical records.' });
    console.log('Categories created successfully.');

    // 4. Create Books
    const books = [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        category: tech._id,
        description: 'A handbook of agile software craftsmanship.',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80',
        totalCopies: 5,
        availableCopies: 5,
        location: 'Aisle A, Shelf 2',
        publishedYear: 2008,
        pricePerDay: 0.50,
        status: 'available',
        pdfUrl: 'https://arxiv.org/pdf/cs/0205028.pdf'
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '9780262033848',
        category: tech._id,
        description: 'The standard textbook on computer algorithms.',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        totalCopies: 3,
        availableCopies: 3,
        location: 'Aisle A, Shelf 3',
        publishedYear: 2009,
        pricePerDay: 1.00,
        status: 'available',
        pdfUrl: 'https://arxiv.org/pdf/1606.05262.pdf'
      },
      {
        title: 'Quantum Mechanics Explained',
        author: 'Richard Feynman',
        isbn: '9780198567264',
        category: science._id,
        description: 'A deep dive into quantum electrodynamics.',
        coverImage: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&q=80',
        totalCopies: 4,
        availableCopies: 4,
        location: 'Aisle C, Shelf 1',
        publishedYear: 1965,
        pricePerDay: 0.75,
        status: 'available',
        pdfUrl: 'https://arxiv.org/pdf/quant-ph/0402156.pdf'
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        category: fiction._id,
        description: 'A novel about the jazz age in New York.',
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80',
        totalCopies: 6,
        availableCopies: 6,
        location: 'Aisle B, Shelf 1',
        publishedYear: 1925,
        pricePerDay: 0.25,
        status: 'available',
        pdfUrl: null
      }
    ];

    await Book.create(books);
    console.log('Sample books seeded successfully!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
