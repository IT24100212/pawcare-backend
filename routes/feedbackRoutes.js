const express = require('express');
const { 
  submitFeedback, 
  getAllFeedback, 
  getAdminFeedback,
  getStaffFeedback,
  getAverageRatings, 
  updateFeedback, 
  deleteFeedback 
} = require('../controllers/feedbackController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Admin & Staff Routes
router.get('/admin', authorizeRoles('Admin'), getAdminFeedback);
router.get('/staff', authorizeRoles('Vet', 'Groomer', 'ShopOwner', 'BoardingManager'), getStaffFeedback);

// Standard / Legacy Routes
router.post('/', submitFeedback);
router.get('/', getAllFeedback);
router.get('/average', getAverageRatings);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

module.exports = router;
