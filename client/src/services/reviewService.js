import api from './api';

export const reviewService = {
    // Получить все отзывы (публичный)
    getReviews: async () => {
        const response = await api.get('/reviews');
        return response.data;
    },

    // Создать отзыв (требует авторизации)
    createReview: async (reviewData) => {
        const response = await api.post('/reviews', reviewData);
        return response.data;
    },

    // Обновить отзыв (требует авторизации, только автор или админ)
    updateReview: async (id, reviewData) => {
        const response = await api.put(`/reviews/${id}`, reviewData);
        return response.data;
    },

    // Удалить отзыв (требует авторизации, только автор или админ)
    deleteReview: async (id) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    }
};
