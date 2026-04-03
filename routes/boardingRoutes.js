const express = require('express');
const { getAvailableSlots, lockSlot, confirmBooking, cancelBooking, getAllBoardingBookings, updateBookingStatus } = require('../controllers/boardingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('PetSitter', 'Admin'), getAllBoardingBookings);
router.put('/:id/status', authorizeRoles('PetSitter', 'Admin'), updateBookingStatus);
router.get('/available', getAvailableSlots);
router.post('/lock', lockSlot);
router.post('/confirm', confirmBooking);
router.delete('/:id', cancelBooking);

module.exports = router;
