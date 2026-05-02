const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Legacy fields (kept for backwards compatibility during migration)
  serviceType: {
    type: String,
    enum: ['Vet', 'Grooming', 'Boarding', 'PetShop'],
  },
  comment: {
    type: String,
  },
  
  // New AI & Feedback Fields
  message: {
    type: String,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  category: {
    type: String,
    enum: ['vet', 'shop', 'grooming', 'delivery', 'app', 'support', 'payment', 'general', 'boarding'],
  },
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
  },
  autoReply: {
    type: String,
  },
  assignedRole: {
    type: String, // E.g., 'Vet', 'ShopOwner', 'Groomer', 'Admin'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
  aiProcessed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;
