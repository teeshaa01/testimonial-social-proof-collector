const User = require('../models/User');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('../utils/token.util');
const {
  getCookieOptions,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE
} = require('../config/constants');
const { generateRandomToken, simulateEmail } = require('../utils/emailSimulator.util');

// Register a new business owner
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Generate email verification token (simulated email)
    const verificationToken = generateRandomToken(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });

    // Create tokens
    const accessToken = signAccessToken({ id: user._id, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id, email: user.email });

    // Store refresh token in user document
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookie('refreshToken', refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

    // Simulate sending email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyLink = `${clientUrl}/verify-email?token=${verificationToken}`;
    const emailPreview = simulateEmail({
      to: user.email,
      subject: 'Verify your Testimonial Collector account',
      link: verifyLink,
      type: 'EMAIL_VERIFICATION'
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully. Verification email simulated.',
      user: user.toJSON(),
      emailPreview: {
        link: verifyLink,
        simulated: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify email simulation
const verifyEmail = async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.'
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You now have full access to your account.'
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email simulation
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    const verificationToken = generateRandomToken(32);
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyLink = `${clientUrl}/verify-email?token=${verificationToken}`;
    simulateEmail({
      to: user.email,
      subject: 'Verify your Testimonial Collector account',
      link: verifyLink,
      type: 'RESEND_EMAIL_VERIFICATION'
    });

    res.status(200).json({
      success: true,
      message: 'Verification email simulated. Check server console or use the returned link.',
      emailPreview: { link: verifyLink }
    });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +refreshTokens');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Generate pair tokens
    const accessToken = signAccessToken({ id: user._id, email: user.email });
    const refreshToken = signRefreshToken({ id: user._id, email: user.email });

    // Store refresh token
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookie('refreshToken', refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token with rotation and reuse detection
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided.'
      });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      // Clear invalid cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid.'
      });
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'User does not exist.'
      });
    }

    // Check if the provided refresh token exists in user's saved tokens
    const tokenIndex = user.refreshTokens.findIndex((t) => t.token === token);

    if (tokenIndex === -1) {
      // Re-use detection: if token is valid JWT but not in DB, someone replayed an old token!
      // Invalidate ALL refresh tokens for this user for security
      user.refreshTokens = [];
      await user.save();
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(403).json({
        success: false,
        message: 'Compromised or reused refresh token detected. All sessions revoked.'
      });
    }

    // Rotate: Remove old token, generate new pair
    user.refreshTokens.splice(tokenIndex, 1);

    const newAccessToken = signAccessToken({ id: user._id, email: user.email });
    const newRefreshToken = signRefreshToken({ id: user._id, email: user.email });

    user.refreshTokens.push({ token: newRefreshToken });
    await user.save();

    // Set new httpOnly cookies
    res.cookie('accessToken', newAccessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// Logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      const decoded = verifyRefreshToken(token);
      if (decoded) {
        await User.updateOne(
          { _id: decoded.id },
          { $pull: { refreshTokens: { token } } }
        );
      }
    }

    // Clear httpOnly cookies
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password simulation
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return success to avoid email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const resetToken = generateRandomToken(32);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;
    simulateEmail({
      to: user.email,
      subject: 'Reset your password for Testimonial Collector',
      link: resetLink,
      type: 'PASSWORD_RESET'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link simulated. Check server console or use the returned link.',
      emailPreview: { link: resetLink }
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+resetPasswordToken +resetPasswordExpires +refreshTokens');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Invalidate existing sessions on password reset
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged in owner
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toJSON()
  });
};

module.exports = {
  signup,
  verifyEmail,
  resendVerification,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};
