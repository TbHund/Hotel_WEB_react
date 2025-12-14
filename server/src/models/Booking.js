const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    // Связи (ObjectId вместо ForeignKey)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Пользователь обязателен']
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: [true, 'Номер обязателен']
    },
    
    // Даты бронирования
    checkInDate: {
        type: Date,
        required: [true, 'Дата заезда обязательна'],
        validate: {
            validator: function(value) {
                return value >= new Date();
            },
            message: 'Дата заезда не может быть в прошлом'
        }
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Дата выезда обязательна'],
        validate: {
            validator: function(value) {
                return value > this.checkInDate;
            },
            message: 'Дата выезда должна быть позже даты заезда'
        }
    },
    actualCheckOutDate: {
        type: Date
    },
    
    // Информация о бронировании
    numberOfGuests: {
        type: Number,
        required: [true, 'Количество гостей обязательно'],
        min: [1, 'Минимум 1 гость'],
        max: [6, 'Максимум 6 гостей']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Общая стоимость обязательна'],
        min: [0, 'Стоимость не может быть отрицательной']
    },
    
    // Статусы
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'partially-paid'],
        default: 'pending'
    },
    
    // Промокод (простая строка вместо связи)
    promotionCode: {
        type: String,
        trim: true,
        uppercase: true
    },
    discountPercent: {
        type: Number,
        min: [0, 'Скидка не может быть отрицательной'],
        max: [100, 'Скидка не может превышать 100%'],
        default: 0
    },
    
    // Дополнительно
    specialRequests: {
        type: String,
        maxlength: [500, 'Особые пожелания не должны превышать 500 символов']
    },
    comments: {
        type: String,
        maxlength: [500, 'Комментарий не должен превышать 500 символов']
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

// Виртуальное поле для расчета длительности проживания
bookingSchema.virtual('duration').get(function() {
    const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Виртуальное поле для отображения статуса на русском
bookingSchema.virtual('statusName').get(function() {
    const statuses = {
        'pending': 'Ожидание',
        'confirmed': 'Подтверждено',
        'checked-in': 'Заселен',
        'checked-out': 'Выселен',
        'cancelled': 'Отменено'
    };
    return statuses[this.status] || this.status;
});

// Виртуальное поле для статуса оплаты на русском
bookingSchema.virtual('paymentStatusName').get(function() {
    const statuses = {
        'pending': 'Ожидает оплаты',
        'paid': 'Оплачено',
        'refunded': 'Возвращено',
        'partially-paid': 'Частично оплачено'
    };
    return statuses[this.paymentStatus] || this.paymentStatus;
});

// Индексы для оптимизации
bookingSchema.index({ user: 1, checkInDate: 1 });
bookingSchema.index({ room: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });

// Middleware для проверки доступности комнаты
bookingSchema.pre('save', async function() {
    if (this.isNew || this.isModified('room') || this.isModified('checkInDate') || this.isModified('checkOutDate')) {
        const Booking = this.constructor;
        const existingBooking = await Booking.findOne({
            _id: { $ne: this._id },
            room: this.room,
            status: { $in: ['confirmed', 'checked-in'] },
            $or: [
                {
                    checkInDate: { $lt: this.checkOutDate },
                    checkOutDate: { $gt: this.checkInDate }
                }
            ]
        });

        if (existingBooking) {
            throw new Error('Комната уже забронирована на выбранные даты');
        }
    }
});

// Автоматическое обновление updatedAt
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Booking', bookingSchema);