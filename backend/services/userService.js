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
 * Find a user by username (includes password for auth comparison).
 */
exports.findByUsernameWithPassword = async (username) => {
  return User.findOne({ username: username.toLowerCase() }).select('+password');
};

/**
 * Find a user by username without password.
 */
exports.findByUsername = async (username) => {
  return User.findOne({ username: username.toLowerCase() }).select('-password');
};

/**
 * Create a new user. Password is hashed by the User model pre-save hook.
 */
exports.createUser = async ({ username, password, name, role }) => {
  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) throw new AppError('Username already exists.', 409);

  const user = new User({ username, password, name, role: role || 'viewer' });
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
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
