const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Получаем токен из заголовка
            token = req.headers.authorization.split(' ')[1];

            // Проверяем токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Получаем пользователя из базы данных (без пароля)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Пользователь не найден'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Неавторизованный доступ, токен недействителен'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Неавторизованный доступ, отсутствует токен'
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Доступ запрещен, требуется роль администратора'
        });
    }
};

const staff = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'receptionist')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Доступ запрещен, требуется роль администратора или ресепшена'
        });
    }
};

const client = (req, res, next) => {
    if (req.user && req.user.role === 'client') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Доступ только для клиентов'
        });
    }
};

module.exports = { protect, admin, staff, client };