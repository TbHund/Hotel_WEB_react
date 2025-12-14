import api from './api';

export const authService = {
    // Регистрация
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.data && response.data.data.token) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
            }
            return response.data;
        } catch (error) {
            // Пробрасываем ошибку с более детальной информацией
            if (error.response) {
                // Сервер ответил с кодом ошибки
                throw {
                    success: false,
                    message: error.response.data?.message || 'Ошибка регистрации',
                    errors: error.response.data?.errors || []
                };
            } else if (error.request) {
                // Запрос был отправлен, но ответа не получено
                throw {
                    success: false,
                    message: 'Сервер не отвечает. Проверьте, запущен ли сервер на порту 5000'
                };
            } else {
                // Ошибка при настройке запроса
                throw {
                    success: false,
                    message: 'Ошибка при отправке запроса'
                };
            }
        }
    },

    // Вход
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.data && response.data.data.token) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data));
            }
            return response.data;
        } catch (error) {
            if (error.response) {
                throw {
                    success: false,
                    message: error.response.data?.message || 'Ошибка входа'
                };
            } else if (error.request) {
                throw {
                    success: false,
                    message: 'Сервер не отвечает. Проверьте, запущен ли сервер на порту 5000'
                };
            } else {
                throw {
                    success: false,
                    message: 'Ошибка при отправке запроса'
                };
            }
        }
    },

    // Выход
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Получение профиля
    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            if (error.response) {
                throw {
                    success: false,
                    message: error.response.data?.message || 'Ошибка получения профиля'
                };
            } else if (error.request) {
                throw {
                    success: false,
                    message: 'Сервер не отвечает'
                };
            } else {
                throw {
                    success: false,
                    message: 'Ошибка при отправке запроса'
                };
            }
        }
    },

    // Обновление профиля
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/auth/profile', userData);
            if (response.data.data && response.data.data.token) {
                localStorage.setItem('token', response.data.data.token);
            }
            return response.data;
        } catch (error) {
            if (error.response) {
                throw {
                    success: false,
                    message: error.response.data?.message || 'Ошибка обновления профиля',
                    errors: error.response.data?.errors || []
                };
            } else if (error.request) {
                throw {
                    success: false,
                    message: 'Сервер не отвечает'
                };
            } else {
                throw {
                    success: false,
                    message: 'Ошибка при отправке запроса'
                };
            }
        }
    },

    // Проверка авторизации
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    // Получение текущего пользователя
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};