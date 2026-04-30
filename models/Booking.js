const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
  },
  serviceType: {
    type: String,
    enum: ['Vet', 'Grooming', 'Boarding'],
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending',
  },
  isInstantSlot: {
    type: Boolean,
    default: false,
  },
  lockedUntil: {
    type: Date,
  },
  updates: [{
    date: { type: Date, default: Date.now },
    photoUrl: { type: String },
    message: { type: String, required: true }
  }]
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
