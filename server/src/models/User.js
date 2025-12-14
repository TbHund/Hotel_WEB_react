const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Основная информация
    firstName: {
        type: String,
        required: [true, 'Имя обязательно'],
        trim: true,
        minlength: [2, 'Имя должно содержать минимум 2 символа'],
        maxlength: [50, 'Имя не должно превышать 50 символов']
    },
    lastName: {
        type: String,
        required: [true, 'Фамилия обязательна'],
        trim: true,
        minlength: [2, 'Фамилия должна содержать минимум 2 символа'],
        maxlength: [50, 'Фамилия не должна превышать 50 символов']
    },
    middleName: {
        type: String,
        trim: true,
        maxlength: [50, 'Отчество не должно превышать 50 символов']
    },
    
    // Авторизация
    email: {
        type: String,
        required: [true, 'Email обязателен'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Введите валидный email']
    },
    password: {
        type: String,
        required: [true, 'Пароль обязателен'],
        minlength: [6, 'Пароль должен содержать минимум 6 символов'],
        select: false
    },
    
    // Дополнительная информация
    phoneNumber: {
        type: String,
        required: [true, 'Телефон обязателен'],
        match: [/^\+375 \((?:29|33|44|25)\) \d{3}-\d{2}-\d{2}$/, 'Формат: +375 (29) XXX-XX-XX']
    },
    birthDate: {
        type: Date,
        validate: {
            validator: function(value) {
                if (!value) return true;
                const age = new Date().getFullYear() - value.getFullYear();
                return age >= 18;
            },
            message: 'Вам должно быть не менее 18 лет'
        }
    },
    hasChildren: {
        type: Boolean,
        default: false
    },
    comments: {
        type: String,
        maxlength: [500, 'Комментарий не должен превышать 500 символов']
    },
    
    // Роли и статусы
    role: {
        type: String,
        enum: ['client', 'admin', 'receptionist'],
        default: 'client'
    },
    isStaff: {
        type: Boolean,
        default: false
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

// Виртуальное поле для полного имени
userSchema.virtual('fullName').get(function() {
    let fullName = `${this.lastName} ${this.firstName}`;
    if (this.middleName) {
        fullName += ` ${this.middleName}`;
    }
    return fullName;
});

userSchema.pre('save', async function(next) {
    // 1. Хеширование пароля
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            return next ? next(error) : Promise.reject(error);
        }
    }
    
    // 2. Обновление updatedAt
    this.updatedAt = Date.now();
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);