const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // Связи
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Пользователь обязателен']
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    
    // Оценка и отзыв
    rating: {
        type: Number,
        required: [true, 'Оценка обязательна'],
        min: [1, 'Минимальная оценка - 1'],
        max: [5, 'Максимальная оценка - 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Оценка должна быть целым числом'
        }
    },
    title: {
        type: String,
        trim: true,
        maxlength: [200, 'Заголовок не должен превышать 200 символов']
    },
    text: {
        type: String,
        required: [true, 'Текст отзыва обязателен'],
        maxlength: [2000, 'Текст отзыва не должен превышать 2000 символов']
    },
    
    // Категории оценки (вместо отдельной модели Service)
    categories: [{
        type: String,
        enum: ['cleanliness', 'comfort', 'staff', 'location', 'price', 'facilities']
    }],
    
    // Модерация
    isApproved: {
        type: Boolean,
        default: false
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    adminResponse: {
        type: String,
        maxlength: [1000, 'Ответ администрации не должен превышать 1000 символов']
    },
    
    // Даты
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Виртуальное поле для категорий на русском
reviewSchema.virtual('categoryNames').get(function() {
    const categories = {
        'cleanliness': 'Чистота',
        'comfort': 'Комфорт',
        'staff': 'Персонал',
        'location': 'Расположение',
        'price': 'Цена',
        'facilities': 'Удобства'
    };
    
    return this.categories.map(cat => categories[cat] || cat);
});

// Виртуальное поле для звездочек рейтинга
reviewSchema.virtual('stars').get(function() {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Индексы для оптимизации
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, isApproved: 1 });
reviewSchema.index({ isApproved: 1, isPublished: 1 });

// Middleware для автоматического утверждения отзывов от доверенных пользователей
reviewSchema.pre('save', async function(next) {
    if (this.isNew) {
        const User = mongoose.model('User');
        const user = await User.findById(this.user);
        
        if (user && user.role === 'admin') {
            this.isApproved = true;
        }
    }
    
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Review', reviewSchema);