const express = require('express');
const { getAvailableSlots, lockSlot, confirmBooking, cancelBooking } = require('../controllers/groomingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/available', getAvailableSlots);
router.post('/lock', lockSlot);
router.post('/confirm', confirmBooking);
router.delete('/:id', cancelBooking);

module.exports = router;
