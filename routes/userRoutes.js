const express = require('express');
const { getProfile, updateProfile, changePassword, deleteMyAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteMyAccount);
router.put('/change-password', changePassword);

module.exports = router;
