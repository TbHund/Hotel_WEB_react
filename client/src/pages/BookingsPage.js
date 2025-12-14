import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { Add, Cancel, Visibility } from '@mui/icons-material';
import { bookingService } from '../services/bookingService';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const user = authService.getCurrentUser();
    const navigate = useNavigate();

    // Загрузка бронирований
    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const response = await bookingService.getMyBookings();
            setBookings(response.data || []);
        } catch (err) {
            setError('Ошибка загрузки бронирований');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Отмена бронирования
    const handleCancel = async (id) => {
        if (window.confirm('Вы уверены, что хотите отменить бронирование?')) {
            try {
                await bookingService.cancelBooking(id);
                loadBookings(); // Перезагружаем список
            } catch (err) {
                setError('Ошибка отмены бронирования');
                console.error(err);
            }
        }
    };

    // Обработчик события: заселение
    const handleCheckIn = async (bookingId) => {
        try {
            await bookingService.updateBooking(bookingId, { status: 'checked-in' });
            loadBookings();
        } catch (err) {
            setError('Ошибка заселения');
        }
    };

    // Обработчик события: выселение
    const handleCheckOut = async (bookingId) => {
        try {
            await bookingService.updateBooking(bookingId, { 
                status: 'checked-out',
                actualCheckOutDate: new Date()
            });
            loadBookings();
        } catch (err) {
            setError('Ошибка выселения');
        }
    };

    // Создание нового бронирования
    const handleNewBooking = () => {
        navigate('/rooms'); // Переход к выбору номера
    };

    // Просмотр деталей
    const handleViewDetails = (id) => {
        console.log('View booking:', id);
        // Здесь можно открыть модальное окно или перейти на страницу деталей
    };

    // Получение цвета статуса
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'warning',
            'confirmed': 'info',
            'checked-in': 'success',
            'checked-out': 'default',
            'cancelled': 'error'
        };
        return colors[status] || 'default';
    };

    // Получение текста статуса
    const getStatusText = (status) => {
        const texts = {
            'pending': 'Ожидание',
            'confirmed': 'Подтверждено',
            'checked-in': 'Заселен',
            'checked-out': 'Выселен',
            'cancelled': 'Отменено'
        };
        return texts[status] || status;
    };

    // Форматирование даты
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    return (
        <Container maxWidth="lg">
            <Box my={4}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">
                        Мои бронирования
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleNewBooking}
                    >
                        Новое бронирование
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : bookings.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            У вас пока нет бронирований
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleNewBooking}
                            sx={{ mt: 2 }}
                        >
                            Забронировать номер
                        </Button>
                    </Paper>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Номер комнаты</TableCell>
                                    <TableCell>Даты</TableCell>
                                    <TableCell>Гостей</TableCell>
                                    <TableCell>Стоимость</TableCell>
                                    <TableCell>Статус</TableCell>
                                    <TableCell>Действия</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookings.map((booking) => (
                                    <TableRow key={booking._id}>
                                        <TableCell>
                                            {booking.room?.roomNumber || 'Номер не найден'}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                                        </TableCell>
                                        <TableCell>
                                            {booking.numberOfGuests}
                                        </TableCell>
                                        <TableCell>
                                            {booking.totalPrice} ₽
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusText(booking.status)}
                                                color={getStatusColor(booking.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <Button
                                                    size="small"
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleViewDetails(booking._id)}
                                                >
                                                    Детали
                                                </Button>
                                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        startIcon={<Cancel />}
                                                        onClick={() => handleCancel(booking._id)}
                                                    >
                                                        Отменить
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Отображение времени (требование задания) */}
                <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="subtitle2" gutterBottom>
                        Информация о времени:
                    </Typography>
                    <Typography variant="body2">
                        Текущее время (UTC): {new Date().toISOString()}
                    </Typography>
                    <Typography variant="body2">
                        Текущее время (локальное): {new Date().toLocaleString('ru-RU')}
                    </Typography>
                    <Typography variant="body2">
                        Временная зона: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default BookingsPage;