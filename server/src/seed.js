const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
require('dotenv').config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Очищаем базу
        console.log('🗑️  Очистка базы данных...');
        await User.deleteMany({});
        await Room.deleteMany({});
        await Booking.deleteMany({});
        await Review.deleteMany({});

        // Создаем пользователей
        const users = await User.create([
            {
                firstName: 'Админ',
                lastName: 'Админов',
                email: 'admin@hotel.com',
                password: 'admin123',
                phoneNumber: '+375 (29) 111-11-11',
                role: 'admin',
                isStaff: true
            },
            {
                firstName: 'Рецепшн',
                lastName: 'Рецепшнов',
                email: 'reception@hotel.com',
                password: 'reception123',
                phoneNumber: '+375 (29) 222-22-22',
                role: 'receptionist',
                isStaff: true
            },
            {
                firstName: 'Иван',
                lastName: 'Иванов',
                email: 'ivan@mail.com',
                password: 'ivan123',
                phoneNumber: '+375 (29) 333-33-33',
                role: 'client'
            },
            {
                firstName: 'Мария',
                lastName: 'Петрова',
                email: 'maria@mail.com',
                password: 'maria123',
                phoneNumber: '+375 (29) 444-44-44',
                role: 'client'
            }
        ]);

        // Создаем номера
        const rooms = await Room.create([
            {
                roomNumber: '101',
                category: 'standard',
                capacity: 2,
                description: 'Стандартный номер с видом на город',
                pricePerNight: 300,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер'],
                images: []
            },
            {
                roomNumber: '102',
                category: 'standard',
                capacity: 2,
                description: 'Стандартный номер с балконом',
                pricePerNight: 350,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Балкон'],
                images: []
            },
            {
                roomNumber: '103',
                category: 'standard',
                capacity: 2,
                description: 'Стандартный номер с видом на парк',
                pricePerNight: 320,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Холодильник'],
                images: []
            },
            {
                roomNumber: '201',
                category: 'comfort',
                capacity: 3,
                description: 'Комфортный номер для семьи',
                pricePerNight: 500,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Мини-бар', 'Сейф'],
                images: []
            },
            {
                roomNumber: '202',
                category: 'comfort',
                capacity: 3,
                description: 'Комфортный номер с джакузи',
                pricePerNight: 600,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Джакузи', 'Сейф'],
                images: []
            },
            {
                roomNumber: '203',
                category: 'comfort',
                capacity: 4,
                description: 'Комфортный семейный номер',
                pricePerNight: 550,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Мини-бар', 'Сейф', 'Детская кроватка'],
                images: []
            },
            {
                roomNumber: '301',
                category: 'luxury',
                capacity: 4,
                description: 'Люкс номер с панорамным видом',
                pricePerNight: 1000,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Джакузи', 'Мини-бар', 'Сейф', 'Халаты'],
                images: []
            },
            {
                roomNumber: '302',
                category: 'luxury',
                capacity: 4,
                description: 'Люкс номер с балконом и видом на море',
                pricePerNight: 1200,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Джакузи', 'Мини-бар', 'Сейф', 'Халаты', 'Балкон'],
                images: []
            },
            {
                roomNumber: '401',
                category: 'suite',
                capacity: 6,
                description: 'Апартаменты премиум класса',
                pricePerNight: 1100,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Джакузи', 'Мини-бар', 'Сейф', 'Халаты', 'Балкон', 'Гостиная'],
                images: []
            },
            {
                roomNumber: '402',
                category: 'suite',
                capacity: 6,
                description: 'Апартаменты с кухней и гостиной',
                pricePerNight: 1100,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Джакузи', 'Мини-бар', 'Сейф', 'Халаты', 'Балкон', 'Гостиная', 'Кухня'],
                images: []
            },
            {
                roomNumber: '501',
                category: 'luxury',
                capacity: 2,
                description: 'Романтический люкс номер',
                pricePerNight: 1100,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер', 'Джакузи', 'Мини-бар', 'Сейф', 'Халаты', 'Романтическое оформление'],
                images: []
            },
            {
                roomNumber: '502',
                category: 'standard',
                capacity: 1,
                description: 'Одноместный стандартный номер',
                pricePerNight: 200,
                amenities: ['Wi-Fi', 'TV', 'Кондиционер'],
                images: []
            }
        ]);

        // Создаем бронирования
        const bookings = await Booking.create([
            {
                user: users[2]._id, // Иван
                room: rooms[0]._id, // 101
                checkInDate: new Date('2026-12-15'),
                checkOutDate: new Date('2026-12-20'),
                numberOfGuests: 2,
                totalPrice: 15000, // 5 ночей × 3000
                status: 'confirmed'
            },
            {
                user: users[3]._id, // Мария
                room: rooms[2]._id, // 201
                checkInDate: new Date('2026-12-10'),
                checkOutDate: new Date('2026-12-15'),
                numberOfGuests: 3,
                totalPrice: 25000, // 5 ночей × 5000
                status: 'checked-in'
            }
        ]);

        // Создаем отзывы
        const reviews = await Review.create([
            {
                user: users[2]._id,
                booking: bookings[0]._id,
                rating: 5,
                title: 'Отличный отдых!',
                text: 'Очень понравилось, персонал внимательный, номер чистый.',
                categories: ['cleanliness', 'staff'],
                isApproved: true
            },
            {
                user: users[3]._id,
                rating: 4,
                title: 'Хороший сервис',
                text: 'Все хорошо, но завтраки могли бы быть разнообразнее.',
                categories: ['comfort', 'price'],
                isApproved: true
            }
        ]);

        console.log('\n✅ База данных заполнена:');
        console.log(`👥 Пользователей: ${users.length}`);
        console.log(`🏨 Номеров: ${rooms.length}`);
        console.log(`📅 Бронирований: ${bookings.length}`);
        console.log(`⭐ Отзывов: ${reviews.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы:', error);
        process.exit(1);
    }
};

seedDatabase();