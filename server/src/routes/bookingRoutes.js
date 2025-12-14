const express = require('express');
const router = express.Router();
const {
    getBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingStats
} = require('../controllers/bookingController');
const { protect, staff } = require('../middleware/authMiddleware');

// Все маршруты защищены
router.use(protect);

// GET /api/bookings - клиенты видят только свои, админы/ресепшн - все
router.get('/', getBookings);

// POST /api/bookings - любой авторизованный пользователь может создать
router.post('/', createBooking);

// Статистика только для персонала
router.get('/stats', staff, getBookingStats);

// Остальные маршруты
router.route('/:id')
    .get(getBookingById)
    .put(updateBooking)
    .delete(deleteBooking);

module.exports = router;