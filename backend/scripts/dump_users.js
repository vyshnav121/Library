import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const dumpUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({}, 'name email role isVerified verificationOTP otpExpiry resetPasswordToken resetPasswordExpire');
    console.log('--- USER DATA DUMP ---');
    users.forEach(user => {
      console.log(`
Name: ${user.name}
Email: ${user.email}
Role: ${user.role}
Verified: ${user.isVerified}
Verification OTP: ${user.verificationOTP} (Expires: ${user.otpExpiry})
Reset Password Token: ${user.resetPasswordToken} (Expires: ${user.resetPasswordExpire})
`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error dumping users:', error);
    process.exit(1);
  }
};

dumpUsers();
