const express = require('express');
const { getAvailableSlots, lockSlot, confirmBooking, cancelBooking, getAllBoardingBookings, updateBookingStatus, addBoardingUpdate } = require('../controllers/boardingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('BoardingManager', 'Admin'), getAllBoardingBookings);
router.put('/:id/status', authorizeRoles('BoardingManager', 'Admin'), updateBookingStatus);
router.post('/:id/updates', authorizeRoles('BoardingManager', 'Admin'), addBoardingUpdate);
router.get('/available', getAvailableSlots);
router.post('/lock', lockSlot);
router.post('/confirm', confirmBooking);
router.delete('/:id', cancelBooking);

module.exports = router;
