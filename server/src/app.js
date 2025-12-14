const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Загрузка переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Простой логгер запросов
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// Базовый маршрут для проверки
app.get('/', (req, res) => {
    res.json({ 
        message: 'Добро пожаловать в API гостиницы',
        version: '1.0.0',
        database: 'MongoDB Connected',
        timezone: {
            server: 'UTC',
            current: new Date().toISOString(),
            local: new Date().toLocaleString('ru-RU')
        },
        endpoints: {
            auth: '/api/auth',
            rooms: '/api/rooms',
            bookings: '/api/bookings',
            reviews: '/api/reviews',
            users: '/api/users'
        }
    });
});

// API маршруты
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// ========== ВАЖНО: 404 обработчик ДОЛЖЕН БЫТЬ ПОСЛЕ ВСЕХ МАРШРУТОВ ==========
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден',
        requestedUrl: req.originalUrl,
        method: req.method,
        timestamp: {
            utc: new Date().toISOString(),
            local: new Date().toLocaleString('ru-RU'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
    });
});

// ========== Обработка ошибок ДОЛЖНА БЫТЬ ПОСЛЕ 404 ==========
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Внутренняя ошибка сервера';
    
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📡 Режим: ${process.env.NODE_ENV}`);
    console.log(`🌐 API доступно: http://localhost:${PORT}`);
    console.log(`🗄️  База данных: ${process.env.MONGODB_URI}`);
    console.log(`⏰ Текущее время: ${new Date().toLocaleString('ru-RU')}`);
});