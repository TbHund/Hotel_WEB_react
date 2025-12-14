const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Получить все бронирования
// @route   GET /api/bookings
// @access  Private/Staff
const getBookings = async (req, res) => {
    try {
        const {
            status,
            userId,
            roomId,
            startDate,
            endDate,
            sortBy = 'checkInDate',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Строим фильтр
        const filter = {};
        
        if (status) filter.status = status;
        if (userId) filter.user = userId;
        if (roomId) filter.room = roomId;
        
        // Фильтр по датам
        if (startDate || endDate) {
            filter.checkInDate = {};
            if (startDate) filter.checkInDate.$gte = new Date(startDate);
            if (endDate) filter.checkInDate.$lte = new Date(endDate);
        }

        // Права доступа: клиенты видят только свои брони
        if (req.user.role === 'client') {
            filter.user = req.user._id;
        }

        // Настройки сортировки
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        // Пагинация
        const skip = (page - 1) * limit;

        // Выполняем запрос с populate
        const [bookings, total] = await Promise.all([
            Booking.find(filter)
                .populate('user', 'firstName lastName email phoneNumber')
                .populate('room', 'roomNumber category pricePerNight')
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Booking.countDocuments(filter)
        ]);

        // Добавляем информацию о времени
        const bookingsWithTime = bookings.map(booking => ({
            ...booking,
            createdAtUTC: booking.createdAt.toISOString(),
            createdAtLocal: booking.createdAt.toLocaleString('ru-RU'),
            updatedAtUTC: booking.updatedAt.toISOString(),
            updatedAtLocal: booking.updatedAt.toLocaleString('ru-RU'),
            checkInDateUTC: booking.checkInDate.toISOString(),
            checkInDateLocal: booking.checkInDate.toLocaleString('ru-RU'),
            checkOutDateUTC: booking.checkOutDate.toISOString(),
            checkOutDateLocal: booking.checkOutDate.toLocaleString('ru-RU'),
            userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }));

        res.json({
            success: true,
            count: bookings.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: bookingsWithTime
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении бронирований'
        });
    }
};

// @desc    Получить бронирование по ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'firstName lastName email phoneNumber')
            .populate('room', 'roomNumber category pricePerNight amenities')
            .lean();

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Бронирование не найдено'
            });
        }

        // Проверка прав доступа
        if (req.user.role === 'client' && booking.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Доступ запрещен'
            });
        }

        // Добавляем информацию о времени
        const bookingWithTime = {
            ...booking,
            createdAtUTC: booking.createdAt.toISOString(),
            createdAtLocal: booking.createdAt.toLocaleString('ru-RU'),
            updatedAtUTC: booking.updatedAt.toISOString(),
            updatedAtLocal: booking.updatedAt.toLocaleString('ru-RU'),
            checkInDateUTC: booking.checkInDate.toISOString(),
            checkInDateLocal: booking.checkInDate.toLocaleString('ru-RU'),
            checkOutDateUTC: booking.checkOutDate.toISOString(),
            checkOutDateLocal: booking.checkOutDate.toLocaleString('ru-RU'),
            userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        res.json({
            success: true,
            data: bookingWithTime
        });
    } catch (error) {
        console.error('Get booking by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

// @desc    Создать бронирование
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

        // Проверяем существование комнаты
        const room = await Room.findById(roomId);
        if (!room || !room.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Номер не найден или недоступен'
            });
        }

        // Проверяем доступность комнаты
        const existingBooking = await Booking.findOne({
            room: roomId,
            status: { $in: ['confirmed', 'checked-in'] },
            $or: [
                {
                    checkInDate: { $lt: new Date(checkOutDate) },
                    checkOutDate: { $gt: new Date(checkInDate) }
                }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'Номер уже забронирован на выбранные даты'
            });
        }

        // Проверяем вместимость
        if (numberOfGuests > room.capacity) {
            return res.status(400).json({
                success: false,
                message: `Номер вмещает максимум ${room.capacity} гостей`
            });
        }

        // Упрощенный расчет цены
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = room.pricePerNight * nights;

        // Создаем бронирование
        const booking = await Booking.create({
            user: req.user._id,
            room: roomId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests,
            totalPrice,
            specialRequests: specialRequests || '',
            status: 'pending'
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('user', 'firstName lastName email')
            .populate('room', 'roomNumber category pricePerNight')
            .lean();

        res.status(201).json({
            success: true,
            message: 'Бронирование создано',
            data: populatedBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        
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
            message: 'Ошибка сервера при создании бронирования'
        });
    }
};

// @desc    Обновить бронирование
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Бронирование не найдено'
            });
        }

        // Проверка прав доступа
        if (req.user.role === 'client' && booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Доступ запрещен'
            });
        }

        // Обновляем только разрешенные поля
        const allowedUpdates = ['checkInDate', 'checkOutDate', 'numberOfGuests', 'specialRequests', 'status'];
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        
        updates.forEach(key => {
            booking[key] = req.body[key];
        });

        // Для клиентов разрешено только отменять бронирование
        if (req.user.role === 'client' && req.body.status && req.body.status !== 'cancelled') {
            return res.status(403).json({
                success: false,
                message: 'Клиенты могут только отменять бронирования'
            });
        }

        const updatedBooking = await booking.save();
        const populatedBooking = await Booking.findById(updatedBooking._id)
            .populate('user', 'firstName lastName email')
            .populate('room', 'roomNumber category');

        res.json({
            success: true,
            message: 'Бронирование обновлено',
            data: populatedBooking
        });
    } catch (error) {
        console.error('Update booking error:', error);
        
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
            message: 'Ошибка сервера при обновлении бронирования'
        });
    }
};

// @desc    Удалить бронирование
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Бронирование не найден'
            });
        }

        // Только админы могут удалять бронирования
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Только администраторы могут удалять бронирования'
            });
        }

        await booking.deleteOne();
        
        res.json({
            success: true,
            message: 'Бронирование удалено'
        });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при удалении бронирования'
        });
    }
};

// @desc    Получить статистику бронирований
// @route   GET /api/bookings/stats
// @access  Private/Staff
const getBookingStats = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        status: '$status'
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$totalPrice' },
                    avgPrice: { $avg: '$totalPrice' }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            }
        ]);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении статистики'
        });
    }
};

module.exports = {
    getBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    getBookingStats
};