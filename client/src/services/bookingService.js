import api from './api';

export const bookingService = {
    // Получить все бронирования (для админов/сотрудников)
    getBookings: async (params = {}) => {
        const response = await api.get('/bookings', { params });
        return response.data;
    },

    // Получить бронирование по ID
    getBookingById: async (id) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    // Создать бронирование
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    // Обновить бронирование
    updateBooking: async (id, bookingData) => {
        const response = await api.put(`/bookings/${id}`, bookingData);
        return response.data;
    },

    // Отменить бронирование (специальный метод для клиентов)
    cancelBooking: async (id) => {
        const response = await api.put(`/bookings/${id}`, { status: 'cancelled' });
        return response.data;
    },

    // Удалить бронирование (только для админов)
    deleteBooking: async (id) => {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    },

    // Получить статистику (для админов)
    getStats: async () => {
        const response = await api.get('/bookings/stats');
        return response.data;
    },

    // Получить мои бронирования (упрощенная версия)
    getMyBookings: async () => {
        // Просто получаем все бронирования - сервер сам отфильтрует по пользователю
        const response = await api.get('/bookings');
        return response.data;
    }
};