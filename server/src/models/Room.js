const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    // Идентификация
    roomNumber: {
        type: String,
        required: [true, 'Номер комнаты обязателен'],
        unique: true,
        trim: true,
        uppercase: true,
        match: [/^[0-9]{3}[A-Z]?$/, 'Формат: 101 или 101A']
    },
    
    // Категория (вместо внешнего ключа)
    category: {
        type: String,
        required: [true, 'Категория обязательна'],
        enum: {
            values: ['standard', 'comfort', 'luxury', 'suite'],
            message: '{VALUE} не является допустимой категорией'
        },
        default: 'standard'
    },
    
    // Характеристики
    capacity: {
        type: Number,
        required: [true, 'Вместимость обязательна'],
        min: [1, 'Вместимость должна быть не менее 1'],
        max: [6, 'Вместимость должна быть не более 6']
    },
    description: {
        type: String,
        required: [true, 'Описание обязательно'],
        maxlength: [1000, 'Описание не должно превышать 1000 символов']
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Цена за ночь обязательна'],
        min: [0, 'Цена не может быть отрицательной']
    },
    
    // Удобства (массив строк вместо связей)
    amenities: {
        type: [String],
        default: ['Wi-Fi', 'TV', 'Кондиционер', 'Холодильник'],
        validate: {
            validator: function(arr) {
                return arr.length <= 20;
            },
            message: 'Не более 20 удобств'
        }
    },
    
    // Изображения
    images: {
        type: [String],
        default: []
    },
    
    // Статусы
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance', 'cleaning'],
        default: 'available'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Даты
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Виртуальное поле для названия категории на русском
roomSchema.virtual('categoryName').get(function() {
    const categories = {
        'standard': 'Стандарт',
        'comfort': 'Комфорт',
        'luxury': 'Люкс',
        'suite': 'Апартаменты'
    };
    return categories[this.category] || this.category;
});

// Виртуальное поле для отображения статуса на русском
roomSchema.virtual('statusName').get(function() {
    const statuses = {
        'available': 'Доступен',
        'occupied': 'Занят',
        'maintenance': 'На обслуживании',
        'cleaning': 'Уборка'
    };
    return statuses[this.status] || this.status;
});

// Индекс для оптимизации поиска
roomSchema.index({ category: 1, status: 1, pricePerNight: 1 });

// Автоматическое обновление updatedAt
roomSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Room', roomSchema);