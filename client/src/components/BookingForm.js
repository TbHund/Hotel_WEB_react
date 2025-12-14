import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import { CalendarToday, People, Send } from '@mui/icons-material';
import { bookingService } from '../services/bookingService';

const BookingForm = ({ roomId, onSuccess, onCancel }) => {
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Получаем минимальную дату (сегодня)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Простая валидация
        if (!checkInDate || !checkOutDate) {
            setError('Выберите даты заезда и выезда');
            return;
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkOut <= checkIn) {
            setError('Дата выезда должна быть позже даты заезда');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const bookingData = {
                roomId,
                checkInDate,
                checkOutDate,
                numberOfGuests,
                specialRequests
            };

            const response = await bookingService.createBooking(bookingData);
            
            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при создании бронирования');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Бронирование номера
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Дата заезда"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <CalendarToday sx={{ mr: 1 }} />
                            </InputAdornment>
                        ),
                    }}
                    inputProps={{
                        min: getMinDate()
                    }}
                    required
                    sx={{ mb: 2 }}
                    className="hospitality-input"
                />

                <TextField
                    fullWidth
                    label="Дата выезда"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <CalendarToday sx={{ mr: 1 }} />
                            </InputAdornment>
                        ),
                    }}
                    inputProps={{
                        min: checkInDate || getMinDate()
                    }}
                    required
                    sx={{ mb: 2 }}
                    className="hospitality-input"
                />

                <TextField
                    fullWidth
                    label="Количество гостей"
                    type="number"
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(parseInt(e.target.value) || 1)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <People sx={{ mr: 1 }} />
                            </InputAdornment>
                        ),
                    }}
                    inputProps={{ min: 1, max: 10 }}
                    sx={{ mb: 2 }}
                    className="hospitality-input"
                />

                <TextField
                    fullWidth
                    label="Особые пожелания (необязательно)"
                    multiline
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    sx={{ mb: 3 }}
                    className="hospitality-input"
                />

                <Box display="flex" justifyContent="space-between">
                    {onCancel && (
                        <Button onClick={onCancel}>
                            Отмена
                        </Button>
                    )}
                    
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                        className="hospitality-button"
                    >
                        {loading ? 'Обработка...' : 'Забронировать'}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default BookingForm;