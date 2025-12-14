const express = require('express');
const router = express.Router();
const {
    getReviews,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Публичный маршрут - просмотр отзывов для всех
router.get('/', getReviews);

// Защищенные маршруты - требуют авторизации
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;