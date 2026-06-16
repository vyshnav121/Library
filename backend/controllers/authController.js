import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check account lockout status
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(423).json({
        message: `Account is temporarily locked. Try again in ${remainingMinutes} minutes.`,
      });
    }

    if (await user.matchPassword(password)) {
      // Reset lockout counter on success
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      // Create tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      setRefreshTokenCookie(res, refreshToken);

      // Audit Log
      await ActivityLog.create({
        user: user._id,
        action: 'User login success',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        token: accessToken, // Frontend reads 'token'
      });
    } else {
      // Increment login attempts
      user.loginAttempts += 1;
      let isLocked = false;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
        user.loginAttempts = 0; // Reset counter for next cycle
        isLocked = true;
      }
      await user.save();

      // Audit Log
      await ActivityLog.create({
        user: user._id,
        action: isLocked ? 'Account locked due to failed logins' : 'User login failure',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      if (isLocked) {
        return res.status(423).json({
          message: 'Account locked due to 5 failed login attempts. Please try again in 15 minutes.',
        });
      }

      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role: make first user admin, otherwise standard 'user'
    const userCount = await User.countDocuments({});
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: true,
    });

    if (user) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      setRefreshTokenCookie(res, refreshToken);

      // Audit Log
      await ActivityLog.create({
        user: user._id,
        action: 'Account registered',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        token: accessToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private/Public (requires email or login token)
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Audit Log
    await ActivityLog.create({
      user: user._id,
      action: 'Account verified successfully',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Account verified successfully!', isVerified: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[RESENT OTP FOR ${email}]: ${otp}`);

    res.json({ message: 'A new verification code has been generated.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({ token: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
    });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { name, email, googleId, avatar } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        isVerified: true, // Auto-verify google users
        password: '', 
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (avatar && !user.avatar) user.avatar = avatar;
      user.isVerified = true;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    setRefreshTokenCookie(res, refreshToken);

    await ActivityLog.create({
      user: user._id,
      action: 'Google login success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`[PASSWORD RESET CODE FOR ${email}]: ${resetToken}`);

    res.json({ message: 'Password reset code has been printed to console.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: code,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset code' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // Reset lockout counters
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await ActivityLog.create({
      user: user._id,
      action: 'Password reset success',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({ message: 'Password has been successfully updated.' });
  } catch (error) {
    next(error);
  }
};

export {
  authUser,
  registerUser,
  verifyOTP,
  resendOTP,
  refreshAccessToken,
  logoutUser,
  googleLogin,
  getUserProfile,
  forgotPassword,
  resetPassword,
};
