import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip,
    Box,
    Rating,
    Collapse,
    Link
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { roomService } from '../services/roomService';
import { authService } from '../services/authService';

function RoomCard({ room, onBook, userRole }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const user = authService.getCurrentUser(); // Добавить проверку пользователя

    // Обработчик события: клик по карточке
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    // Обработчик события: бронирование номера
    const handleBookClick = async () => {
        if (onBook) {
            setLoading(true);
            try {
                await onBook(room._id);
            } finally {
                setLoading(false);
            }
        }
    };

    // Обработчик события: загрузка истории бронирований
    const handleLoadBookings = async () => {
        // Здесь будет запрос к API для получения бронирований
        console.log('Загрузка истории бронирований для комнаты:', room.roomNumber);
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
            }}
            className="hospitality-card"
        >
            <CardMedia
                component="img"
                height="200"
                image={room.images?.[0] || 'https://via.placeholder.com/345x200'}
                alt={room.roomNumber}
                onClick={handleExpandClick}
                style={{ cursor: 'pointer' }}
            />
            
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" component="div">
                        Номер {room.roomNumber}
                    </Typography>
                    <Chip 
                        label={room.categoryName} 
                        color="primary" 
                        size="small"
                    />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Категория: {room.categoryName}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Вместимость: {room.capacity} чел.
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="h6" color="primary">
                        {room.pricePerNight} ₽ / ночь
                    </Typography>
                    <Button
                        size="small"
                        onClick={handleExpandClick}
                        endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    >
                        {expanded ? 'Скрыть' : 'Подробнее'}
                    </Button>
                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box mt={2}>
                        <Typography variant="body2" paragraph>
                            {room.description}
                        </Typography>
                        
                        <Typography variant="subtitle2" gutterBottom>
                            Удобства:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                            {room.amenities.map((amenity, index) => (
                                <Chip key={index} label={amenity} size="small" variant="outlined" />
                            ))}
                        </Box>

                        <Typography variant="caption" display="block" color="text.secondary">
                            Добавлено: {new Date(room.createdAt).toLocaleDateString('ru-RU')}
                        </Typography>
                    </Box>
                </Collapse>

                <Box mt={2} display="flex" gap={1}>
                    {user ? (
                        // Показываем кнопку бронирования только авторизованным
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleBookClick}
                            disabled={loading || room.status !== 'available'}
                        >
                            {loading ? 'Обработка...' : 'Забронировать'}
                        </Button>
                    ) : (
                        // Для неавторизованных - кнопка перехода на страницу деталей
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            component={Link}
                            to={`/room/${room._id}`}
                        >
                            Подробнее
                        </Button>
                    )}
                    
                    {userRole === 'admin' && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleLoadBookings}
                        >
                            История
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

// Props по умолчанию
RoomCard.defaultProps = {
    room: {
        amenities: [],
        images: []
    },
    userRole: 'client'
};

export default RoomCard;