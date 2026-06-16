import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const seedAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword123', salt);

    const admin = await User.findOneAndUpdate(
      { email: 'admin@smartlibrary.com' },
      {
        name: 'System Admin',
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log('Admin user updated/created successfully!');
    console.log('Email: admin@smartlibrary.com');
    console.log('Password: adminpassword123');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
