const Room = require('../models/Room');

// @desc    Получить все номера
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
    try {
        const {
            category,
            status,
            minPrice,
            maxPrice,
            minCapacity,
            maxCapacity,
            search,
            sortBy = 'roomNumber',
            order = 'asc',
            page = 1,
            limit = 10
        } = req.query;

        // Строим фильтр
        const filter = { isActive: true };
        
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (minPrice || maxPrice) {
            filter.pricePerNight = {};
            if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
            if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
        }
        if (minCapacity || maxCapacity) {
            filter.capacity = {};
            if (minCapacity) filter.capacity.$gte = Number(minCapacity);
            if (maxCapacity) filter.capacity.$lte = Number(maxCapacity);
        }
        if (search) {
            filter.$or = [
                { roomNumber: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Настройки сортировки
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder;

        // Пагинация
        const skip = (page - 1) * limit;

        // Выполняем запрос с пагинацией
        const [rooms, total] = await Promise.all([
            Room.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Room.countDocuments(filter)
        ]);

        // Добавляем UTC и локальное время для каждой записи
        const roomsWithTime = rooms.map(room => ({
            ...room,
            createdAtUTC: room.createdAt.toISOString(),
            createdAtLocal: room.createdAt.toLocaleString('ru-RU'),
            updatedAtUTC: room.updatedAt.toISOString(),
            updatedAtLocal: room.updatedAt.toLocaleString('ru-RU')
        }));

        res.json({
            success: true,
            count: rooms.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            data: roomsWithTime
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при получении номеров'
        });
    }
};

// @desc    Получить номер по ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).lean();
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Номер не найден'
            });
        }

        // Добавляем информацию о времени
        const roomWithTime = {
            ...room,
            createdAtUTC: room.createdAt.toISOString(),
            createdAtLocal: room.createdAt.toLocaleString('ru-RU'),
            updatedAtUTC: room.updatedAt.toISOString(),
            updatedAtLocal: room.updatedAt.toLocaleString('ru-RU'),
            // Добавляем временную зону пользователя
            userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        res.json({
            success: true,
            data: roomWithTime
        });
    } catch (error) {
        console.error('Get room by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера'
        });
    }
};

// @desc    Создать номер
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
    try {
        const room = await Room.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Номер успешно создан',
            data: room
        });
    } catch (error) {
        console.error('Create room error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: messages
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Номер с таким номером комнаты уже существует'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при создании номера'
        });
    }
};

// @desc    Обновить номер
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Номер не найден'
            });
        }

        // Обновляем поля
        Object.keys(req.body).forEach(key => {
            room[key] = req.body[key];
        });

        const updatedRoom = await room.save();
        
        res.json({
            success: true,
            message: 'Номер успешно обновлен',
            data: updatedRoom
        });
    } catch (error) {
        console.error('Update room error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Ошибка валидации',
                errors: messages
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Номер с таким номером комнаты уже существует'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при обновлении номера'
        });
    }
};

// @desc    Удалить номер
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Номер не найден'
            });
        }

        // Мягкое удаление - меняем статус
        room.isActive = false;
        await room.save();
        
        res.json({
            success: true,
            message: 'Номер деактивирован'
        });
    } catch (error) {
        console.error('Delete room error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при удалении номера'
        });
    }
};

// @desc    Получить доступные номера на даты
// @route   GET /api/rooms/available
// @access  Public
const getAvailableRooms = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, category, capacity } = req.query;
        
        if (!checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: 'Необходимо указать даты заезда и выезда'
            });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: 'Дата выезда должна быть позже даты заезда'
            });
        }

        // Находим занятые номера на эти даты
        const Booking = require('../models/Booking');
        const bookedRooms = await Booking.find({
            status: { $in: ['confirmed', 'checked-in'] },
            $or: [
                {
                    checkInDate: { $lt: checkOut },
                    checkOutDate: { $gt: checkIn }
                }
            ]
        }).distinct('room');

        // Фильтр для доступных номеров
        const filter = {
            _id: { $nin: bookedRooms },
            status: 'available',
            isActive: true
        };

        if (category) filter.category = category;
        if (capacity) filter.capacity = { $gte: Number(capacity) };

        const availableRooms = await Room.find(filter);

        res.json({
            success: true,
            count: availableRooms.length,
            data: availableRooms
        });
    } catch (error) {
        console.error('Get available rooms error:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка сервера при поиске доступных номеров'
        });
    }
};

module.exports = {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms
};