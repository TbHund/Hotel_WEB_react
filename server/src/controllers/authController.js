const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, birthDate } = req.body;

        // Проверяем, существует ли пользователь
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Пользователь с таким email уже существует'
            });
        }

        // Создаем пользователя
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            birthDate: birthDate ? new Date(birthDate) : null,
            role: 'client'
        });

        if (user) {
            // Генерируем токен
            const token = generateToken(user._id, user.role);
            
            res.status(201).json({
                success: true,
                message: 'Регистрация успешна',
                data: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    token
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Неверные данные пользователя'
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Обработка ошибок валидации Mongoose
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
            message: 'Ошибка сервера при регистрации'
        });
    }
};

// @desc    Авторизация пользователя
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Находим пользователя с паролем
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем пароль
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Неверный email или пароль'
            });
        }

        // Проверяем активность пользователя
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Аккаунт деактивирован'
            });
        }

        // Генерируем токен
        const token = generateToken(user._id, user.role);
        
        res.json({
            success: true,
            message: 'Авторизация успешна',
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при авторизации'
        });
    }
};

// @desc    Получение профиля пользователя
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

// @desc    Обновление профиля пользователя
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Пользователь не найден'
            });
        }

        // Обновляем разрешенные поля
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.middleName = req.body.middleName || user.middleName;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.birthDate = req.body.birthDate ? new Date(req.body.birthDate) : user.birthDate;
        user.hasChildren = req.body.hasChildren !== undefined ? req.body.hasChildren : user.hasChildren;
        user.comments = req.body.comments || user.comments;

        // Если обновляется email, проверяем уникальность
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email уже используется другим пользователем'
                });
            }
            user.email = req.body.email;
        }

        // Если обновляется пароль
        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();
        
        // Генерируем новый токен, если обновился email
        let token;
        if (req.body.email && req.body.email !== req.user.email) {
            token = generateToken(updatedUser._id, updatedUser.role);
        }

        res.json({
            success: true,
            message: 'Профиль обновлен',
            data: {
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                role: updatedUser.role,
                token: token || req.headers.authorization?.split(' ')[1]
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        
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
            message: 'Ошибка сервера при обновлении профиля'
        });
    }
};

// @desc    Выход из системы (на клиенте просто удаляем токен)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
    res.json({
        success: true,
        message: 'Выход выполнен успешно'
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logoutUser
};