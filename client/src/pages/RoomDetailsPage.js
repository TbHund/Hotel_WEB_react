import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Chip,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import { ArrowBack, BookOnline } from '@mui/icons-material';
import { roomService } from '../services/roomService';
import BookingForm from '../components/BookingForm';
import FaceCheckIn from '../components/FaceCheckIn';
import RoomAllocation from '../components/RoomAllocation';
import ServiceManager from '../components/ServiceManager';
import { authService } from '../services/authService';

const RoomDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBooking, setShowBooking] = useState(false);
    const user = authService.getCurrentUser();

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const response = await roomService.getRoomById(id);
                setRoom(response.data);
            } catch (err) {
                setError('Ошибка при загрузке номера');
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [id]);

    // Обработчик события: заселение
    const handleCheckIn = (data) => {
        console.log('Check-in:', data);
        alert(`Заселение выполнено для ${data.guestName}`);
    };

    // Обработчик события: выселение
    const handleCheckOut = (data) => {
        console.log('Check-out:', data);
        alert(`Выселение выполнено для номера ${data.roomNumber}`);
    };

    // Обработчик события: сканирование лица
    const handleFaceScan = (data) => {
        console.log('Face scanned:', data);
    };

    // Обработчик события: назначение номера
    const handleRoomAssign = (data) => {
        console.log('Room assigned:', data);
    };

    // Обработчик события: запрос услуги
    const handleServiceRequest = (data) => {
        console.log('Service requested:', data);
        alert('Услуга запрошена успешно!');
    };

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error || !room) {
        return (
            <Container>
                <Alert severity="error">{error || 'Номер не найден'}</Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/rooms')} sx={{ mt: 2 }}>
                    Вернуться к номерам
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/rooms')}
                sx={{ mb: 2 }}
            >
                Назад к номерам
            </Button>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Номер {room.roomNumber}
                        </Typography>
                        <Chip label={room.categoryName} color="primary" sx={{ mb: 2 }} />
                        
                        <Typography variant="body1" paragraph>
                            {room.description}
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Вместимость:</Typography>
                                <Typography variant="body1">{room.capacity} чел.</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2">Цена за ночь:</Typography>
                                <Typography variant="h6" color="primary">
                                    {room.pricePerNight} ₽
                                </Typography>
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" gutterBottom>
                            Удобства:
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                            {room.amenities.map((amenity, index) => (
                                <Chip key={index} label={amenity} size="small" />
                            ))}
                        </Box>

                        {/* Отображение дат в UTC и локальном времени */}
                        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                            <Typography variant="subtitle2" gutterBottom>
                                Информация о времени:
                            </Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" display="block">
                                        Создан (UTC): {room.createdAtUTC}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Создан (локально): {room.createdAtLocal}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" display="block">
                                        Обновлен (UTC): {room.updatedAtUTC}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Обновлен (локально): {room.updatedAtLocal}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" display="block">
                                        Временная зона: {room.userTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Кнопка бронирования - только для авторизованных */}
                        {user ? (
                            <Button
                                variant="contained"
                                startIcon={<BookOnline />}
                                onClick={() => setShowBooking(!showBooking)}
                                sx={{ mt: 2 }}
                            >
                                {showBooking ? 'Скрыть форму бронирования' : 'Забронировать'}
                            </Button>
                        ) : (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Для бронирования номера необходимо войти в систему
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component={Link}
                                    to="/login"
                                    sx={{ mt: 1 }}
                                >
                                    Войти
                                </Button>
                            </Box>
                        )}

                        {showBooking && user && (
                            <Box mt={3}>
                                <BookingForm
                                    roomId={room._id}
                                    onSuccess={() => {
                                        setShowBooking(false);
                                        navigate('/bookings');
                                    }}
                                    onCancel={() => setShowBooking(false)}
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    {user?.role === 'receptionist' || user?.role === 'admin' ? (
                        <>
                            <Box mb={2}>
                                <FaceCheckIn
                                    guestName={user.firstName}
                                    onFaceScan={handleFaceScan}
                                />
                            </Box>
                            <Box mb={2}>
                                <RoomAllocation
                                    rooms={[room]}
                                    guestName={user.firstName}
                                    onRoomAssign={handleRoomAssign}
                                />
                            </Box>
                            <ServiceManager
                                bookingId={room._id}
                                onServiceRequest={handleServiceRequest}
                            />
                        </>
                    ) : (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Войдите как администратор или ресепшн для доступа к функциям управления
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default RoomDetailsPage;