const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Получить все отзывы
// @route   GET /api/reviews
// @access  Public (просмотр для всех)
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ isPublished: true, isApproved: true })
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .lean();

        // Добавляем информацию о времени
        const reviewsWithTime = reviews.map(review => ({
            ...review,
            createdAtUTC: review.createdAt.toISOString(),
            createdAtLocal: review.createdAt.toLocaleString('ru-RU'),
            updatedAtUTC: review.updatedAt ? review.updatedAt.toISOString() : null,
            updatedAtLocal: review.updatedAt ? review.updatedAt.toLocaleString('ru-RU') : null
        }));

        res.json({
            success: true,
            count: reviews.length,
            data: reviewsWithTime
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении отзывов'
        });
    }
};

// @desc    Создать отзыв
// @route   POST /api/reviews
// @access  Private (только авторизованные)
const createReview = async (req, res) => {
    try {
        const { rating, title, text, categories, bookingId } = req.body;

        const review = await Review.create({
            user: req.user._id,
            booking: bookingId || null,
            rating,
            title,
            text,
            categories: categories || [],
            isApproved: false, // Требует модерации
            isPublished: true
        });

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'firstName lastName')
            .lean();

        res.status(201).json({
            success: true,
            message: 'Отзыв создан и отправлен на модерацию',
            data: populatedReview
        });
    } catch (error) {
        console.error('Create review error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: messages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при создании отзыва'
        });
    }
};

// @desc    Обновить отзыв
// @route   PUT /api/reviews/:id
// @access  Private (только автор или админ)
const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }

        // Проверка прав: только автор или админ может редактировать
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав для редактирования этого отзыва'
            });
        }

        // Обновляем поля
        if (req.body.rating) review.rating = req.body.rating;
        if (req.body.title) review.title = req.body.title;
        if (req.body.text) review.text = req.body.text;
        if (req.body.categories) review.categories = req.body.categories;
        
        // Если админ обновляет, может изменить статус модерации
        if (req.user.role === 'admin' && req.body.isApproved !== undefined) {
            review.isApproved = req.body.isApproved;
        }

        await review.save();

        const populatedReview = await Review.findById(review._id)
            .populate('user', 'firstName lastName')
            .lean();

        res.json({
            success: true,
            message: 'Отзыв обновлен',
            data: populatedReview
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при обновлении отзыва'
        });
    }
};

// @desc    Удалить отзыв
// @route   DELETE /api/reviews/:id
// @access  Private (только автор или админ)
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Отзыв не найден'
            });
        }

        // Проверка прав: только автор или админ может удалить
        if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Нет прав для удаления этого отзыва'
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Отзыв удален'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при удалении отзыва'
        });
    }
};

module.exports = {
    getReviews,
    createReview,
    updateReview,
    deleteReview
};

