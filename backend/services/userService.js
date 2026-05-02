// services/userService.js
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Find a user by MongoDB _id, excluding the password field.
 */
exports.findById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Find a user by MongoDB _id, including the password field.
 */
exports.findByIdWithPassword = async (id) => {
  const user = await User.findById(id).select('+password');
  if (!user) throw new AppError('User not found.', 404);
  return user;
};

/**
 * Find a user by email (includes password for auth comparison).
 */
exports.findByEmailWithPassword = async (email) => {
  return User.findOne({ email: email.toLowerCase() }).select('+password');
};

/**
 * Find a user by username without password.
 */
exports.findByUsername = async (username) => {
  return User.findOne({ username: username.toLowerCase() }).select('-password');
};

/**
 * Find a user by email without password.
 */
exports.findByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() }).select('-password');
};

/**
 * Create a new user. Password is hashed by the User model pre-save hook.
 */
exports.createUser = async ({ username, email, password, name, role }) => {
  const normalizedUsername = username.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) throw new AppError('Username already exists.', 409);

  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) throw new AppError('Email already exists.', 409);

  const user = new User({ username: normalizedUsername, email: normalizedEmail, password, name, role: role || 'viewer' });
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

/**
 * Search users by username or name (for mention autocomplete).
 */
exports.searchUsers = async (query = '', limit = 10) => {
  const searchQuery = query
    ? { $or: [
        { username: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ] }
    : {};
  return User.find(searchQuery).select('username name').limit(limit);
};

/**
 * Format a user document for public API responses.
 */
exports.formatUser = (user) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/**
 * Update user fields (username, name).
 */
exports.updateUser = async (userId, { username, name }) => {
  const updates = {};

  if (username !== undefined) {
    const normalizedUsername = username.toLowerCase();
    const existing = await User.findOne({ username: normalizedUsername, _id: { $ne: userId } });
    if (existing) throw new AppError('Username already exists.', 409);
    updates.username = normalizedUsername;
  }

  if (name !== undefined) {
    updates.name = name.trim();
  }

  const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
  if (!user) throw new AppError('User not found.', 404);
  return user;
};
