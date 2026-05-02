const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, profileImage } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isDeleted = true;
    user.name = 'Deleted User';
    user.email = `deleted_${Date.now()}_${user._id}@pawcare.com`;
    user.phone = '';
    user.password = await bcrypt.hash(Date.now().toString(), 10);
    await user.save();

    await Order.updateMany(
      { userId: user._id, status: { $in: ['Pending', 'Ready'] } },
      { $set: { status: 'Cancelled' } }
    );
    await Booking.updateMany(
      { userId: user._id, status: { $in: ['Pending', 'Approved'] } },
      { $set: { status: 'Cancelled' } }
    );

    res.status(200).json({ message: 'Account securely deleted and pending items cancelled.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, deleteMyAccount };
