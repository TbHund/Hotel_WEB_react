import api from './api';

export const roomService = {
    // Получить все номера
    getRooms: async (params = {}) => {
        const response = await api.get('/rooms', { params });
        return response.data;
    },

    // Получить номер по ID
    getRoomById: async (id) => {
        const response = await api.get(`/rooms/${id}`);
        return response.data;
    },

    // Получить доступные номера
    getAvailableRooms: async (checkInDate, checkOutDate, filters = {}) => {
        const params = { checkInDate, checkOutDate, ...filters };
        const response = await api.get('/rooms/available', { params });
        return response.data;
    },

    // Создать номер (только для админов)
    createRoom: async (roomData) => {
        const response = await api.post('/rooms', roomData);
        return response.data;
    },

    // Обновить номер (только для админов)
    updateRoom: async (id, roomData) => {
        const response = await api.put(`/rooms/${id}`, roomData);
        return response.data;
    },

    // Удалить номер (только для админов)
    deleteRoom: async (id) => {
        const response = await api.delete(`/rooms/${id}`);
        return response.data;
    }
};