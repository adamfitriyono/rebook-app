const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '24h',
  });

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  phoneNumber: user.phoneNumber,
  profileImage: user.profileImage,
  address: user.address,
  city: user.city,
  province: user.province,
  postalCode: user.postalCode,
});

exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName, role = 'buyer' } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Email, password, and fullName are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles = ['buyer', 'seller'];
    const userRole = validRoles.includes(role) ? role : 'buyer';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: userRole,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, address, city, province, postalCode } = req.body;

    const data = {
      ...(fullName && { fullName }),
      ...(phoneNumber !== undefined && { phoneNumber }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(province !== undefined && { province }),
      ...(postalCode !== undefined && { postalCode }),
    };

    if (req.file) {
      data.profileImage = `/uploads/${req.file.filename}`;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};
