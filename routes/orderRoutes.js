const express = require('express');
const { placeOrder, getMyOrders, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(placeOrder)
  .get(getMyOrders);

router.route('/:id')
  .delete(cancelOrder);

router.route('/:id/status')
  .put(authorizeRoles('ShopOwner', 'Admin'), updateOrderStatus);

module.exports = router;
