import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    TextField,
    Button,
    Rating,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { 
    Send, 
    Star, 
    Person, 
    CalendarToday,
    Edit,
    Delete,
    ThumbUp,
    ThumbDown
} from '@mui/icons-material';
import { authService } from '../services/authService';
import { reviewService } from '../services/reviewService';
import { Link } from 'react-router-dom';

const ReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        title: '',
        text: '',
        categories: []
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingReview, setEditingReview] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(null);
    const user = authService.getCurrentUser();

    // Категории для отзывов
    const categories = [
        { value: 'cleanliness', label: 'Чистота' },
        { value: 'comfort', label: 'Комфорт' },
        { value: 'staff', label: 'Персонал' },
        { value: 'location', label: 'Расположение' },
        { value: 'price', label: 'Цена' },
        { value: 'facilities', label: 'Удобства' }
    ];

    // Загрузка отзывов
    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            setLoading(true);
            // Временные данные для демонстрации
            const mockReviews = [
                {
                    _id: '1',
                    user: {
                        firstName: 'Анна',
                        lastName: 'Иванова',
                        fullName: 'Анна Иванова'
                    },
                    rating: 5,
                    title: 'Отличный отдых!',
                    text: 'Очень понравилось обслуживание и номера. Обязательно вернемся снова!',
                    categories: ['cleanliness', 'comfort', 'staff'],
                    createdAt: new Date('2025-12-10'),
                    isApproved: true
                },
                {
                    _id: '2',
                    user: {
                        firstName: 'Петр',
                        lastName: 'Сидоров',
                        fullName: 'Петр Сидоров'
                    },
                    rating: 4,
                    title: 'Хорошо, но есть нюансы',
                    text: 'В целом все хорошо, но завтраки могли бы быть разнообразнее.',
                    categories: ['comfort', 'price'],
                    createdAt: new Date('2025-12-08'),
                    isApproved: true
                },
                {
                    _id: '3',
                    user: {
                        firstName: 'Мария',
                        lastName: 'Петрова',
                        fullName: 'Мария Петрова'
                    },
                    rating: 5,
                    title: 'Прекрасный сервис',
                    text: 'Персонал очень внимательный, номера чистые и уютные. Спасибо!',
                    categories: ['staff', 'cleanliness', 'facilities'],
                    createdAt: new Date('2025-12-05'),
                    isApproved: true
                },
                {
                    _id: '4',
                    user: {
                        firstName: 'Иван',
                        lastName: 'Кузнецов',
                        fullName: 'Иван Кузнецов'
                    },
                    rating: 3,
                    title: 'Нормально',
                    text: 'Цены немного завышены, но в целом неплохо.',
                    categories: ['price'],
                    createdAt: new Date('2025-12-03'),
                    isApproved: true
                },
                {
                    _id: '5',
                    user: {
                        firstName: 'Елена',
                        lastName: 'Смирнова',
                        fullName: 'Елена Смирнова'
                    },
                    rating: 5,
                    title: 'Лучшая гостиница в городе!',
                    text: 'Останавливаемся здесь уже не первый раз. Всегда на высоте!',
                    categories: ['location', 'comfort', 'staff'],
                    createdAt: new Date('2025-11-28'),
                    isApproved: true
                }
            ];
            setReviews(mockReviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            setMessage({ type: 'error', text: 'Ошибка загрузки отзывов' });
        } finally {
            setLoading(false);
        }
    };

    // Обработчик изменения рейтинга
    const handleRatingChange = (event, newValue) => {
        setNewReview({ ...newReview, rating: newValue });
    };

    // Обработчик изменения текста
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewReview({ ...newReview, [name]: value });
    };

    // Обработчик выбора категории
    const handleCategoryToggle = (category) => {
        setNewReview(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };

    // Обработчик отправки отзыва
    const handleSubmitReview = async () => {
        if (!newReview.text.trim()) {
            setMessage({ type: 'error', text: 'Введите текст отзыва' });
            return;
        }

        try {
            setSubmitting(true);
            
            // Здесь будет вызов API
            console.log('Submitting review:', newReview);
            
            // Временная логика для демонстрации
            const newReviewObj = {
                _id: Date.now().toString(),
                user: {
                    firstName: user?.firstName || 'Аноним',
                    lastName: user?.lastName || 'Пользователь',
                    fullName: user?.fullName || 'Анонимный пользователь'
                },
                ...newReview,
                createdAt: new Date(),
                isApproved: user?.role === 'admin'
            };

            setReviews([newReviewObj, ...reviews]);
            setNewReview({
                rating: 5,
                title: '',
                text: '',
                categories: []
            });
            setMessage({ type: 'success', text: 'Отзыв отправлен на модерацию' });
        } catch (error) {
            console.error('Error submitting review:', error);
            setMessage({ type: 'error', text: 'Ошибка отправки отзыва' });
        } finally {
            setSubmitting(false);
        }
    };

    // Обработчик редактирования отзыва
    const handleEditReview = (review) => {
        setEditingReview(review);
        setNewReview({
            rating: review.rating,
            title: review.title,
            text: review.text,
            categories: review.categories
        });
    };

    // Обработчик удаления отзыва
    const handleDeleteReview = async (reviewId) => {
        if (!user) {
            setMessage({ type: 'error', text: 'Необходима авторизация' });
            return;
        }

        try {
            await reviewService.deleteReview(reviewId);
            setReviews(reviews.filter(r => r._id !== reviewId));
            setDeleteDialog(null);
            setMessage({ type: 'success', text: 'Отзыв удален' });
        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Ошибка удаления отзыва' 
            });
        }
    };

    // Обработчик лайка/дизлайка
    const handleLikeDislike = (reviewId, action) => {
        console.log(`${action} review ${reviewId}`);
        // Здесь будет логика лайков/дизлайков
    };

    // Форматирование даты
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Получение цвета категории
    const getCategoryColor = (category) => {
        const colors = {
            cleanliness: 'success',
            comfort: 'primary',
            staff: 'warning',
            location: 'info',
            price: 'error',
            facilities: 'secondary'
        };
        return colors[category] || 'default';
    };

    return (
        <Container maxWidth="lg">
            <Box my={4}>
                <Typography variant="h3" gutterBottom align="center">
                    Отзывы наших гостей
                </Typography>

                {message.text && (
                    <Alert 
                        severity={message.type} 
                        sx={{ mb: 3 }}
                        onClose={() => setMessage({ type: '', text: '' })}
                    >
                        {message.text}
                    </Alert>
                )}

                {/* Форма для нового отзыва - только для авторизованных */}
                {user ? (
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Оставить отзыв
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Typography component="legend" mr={2}>
                                        Ваша оценка:
                                    </Typography>
                                    <Rating
                                        name="rating"
                                        value={newReview.rating}
                                        onChange={handleRatingChange}
                                        icon={<Star fontSize="inherit" />}
                                    />
                                    <Typography ml={2}>
                                        {newReview.rating} звезд
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Заголовок отзыва (необязательно)"
                                    name="title"
                                    value={newReview.title}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Текст отзыва"
                                    name="text"
                                    value={newReview.text}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Категории оценки:
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {categories.map((category) => (
                                        <Button
                                            key={category.value}
                                            variant={
                                                newReview.categories.includes(category.value) 
                                                    ? "contained" 
                                                    : "outlined"
                                            }
                                            color={getCategoryColor(category.value)}
                                            size="small"
                                            onClick={() => handleCategoryToggle(category.value)}
                                        >
                                            {category.label}
                                        </Button>
                                    ))}
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Send />}
                                    onClick={handleSubmitReview}
                                    disabled={submitting || !newReview.text.trim()}
                                    fullWidth
                                >
                                    {submitting ? 'Отправка...' : 'Отправить отзыв'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                ) : (
                    <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            Чтобы оставить отзыв, пожалуйста, войдите в систему
                        </Typography>
                        <Button 
                            variant="contained" 
                            component={Link} 
                            to="/login"
                            sx={{ mt: 2 }}
                        >
                            Войти
                        </Button>
                    </Paper>
                )}

                {/* Список отзывов */}
                <Typography variant="h5" gutterBottom>
                    Все отзывы ({reviews.length})
                </Typography>

                {loading ? (
                    <Box display="flex" justifyContent="center" my={4}>
                        <CircularProgress />
                    </Box>
                ) : reviews.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            Пока нет отзывов. Будьте первым!
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {reviews.map((review) => (
                            <Grid item xs={12} key={review._id}>
                                <Card>
                                    <CardHeader
                                        avatar={
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                {review.user.firstName[0]}
                                            </Avatar>
                                        }
                                        title={review.user.fullName}
                                        subheader={
                                            <Box display="flex" alignItems="center">
                                                <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                                                {formatDate(review.createdAt)}
                                                {!review.isApproved && (
                                                    <Typography 
                                                        variant="caption" 
                                                        color="warning.main" 
                                                        ml={2}
                                                    >
                                                        На модерации
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        action={
                                            // Показываем кнопки только авторизованным пользователям
                                            user && (user.role === 'admin' || user._id === review.user?._id) && (
                                                <Box>
                                                    <IconButton 
                                                        onClick={() => handleEditReview(review)}
                                                        size="small"
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton 
                                                        onClick={() => setDeleteDialog(review._id)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            )
                                        }
                                    />
                                    
                                    <CardContent>
                                        <Box display="flex" alignItems="center" mb={2}>
                                            <Rating
                                                value={review.rating}
                                                readOnly
                                                icon={<Star fontSize="inherit" />}
                                            />
                                            <Typography variant="h6" ml={2}>
                                                {review.title}
                                            </Typography>
                                        </Box>
                                        
                                        <Typography paragraph>
                                            {review.text}
                                        </Typography>
                                        
                                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                            {review.categories.map((category) => {
                                                const cat = categories.find(c => c.value === category);
                                                return cat && (
                                                    <Button
                                                        key={category}
                                                        variant="outlined"
                                                        color={getCategoryColor(category)}
                                                        size="small"
                                                        disabled
                                                    >
                                                        {cat.label}
                                                    </Button>
                                                );
                                            })}
                                        </Box>
                                        
                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleLikeDislike(review._id, 'like')}
                                                >
                                                    <ThumbUp />
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleLikeDislike(review._id, 'dislike')}
                                                >
                                                    <ThumbDown />
                                                </IconButton>
                                            </Box>
                                            
                                            <Typography variant="caption" color="text.secondary">
                                                {/* Отображение времени в UTC и локальное (требование задания) */}
                                                UTC: {new Date(review.createdAt).toISOString()} | 
                                                Локальное: {new Date(review.createdAt).toLocaleString('ru-RU')}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={!!deleteDialog}
                onClose={() => setDeleteDialog(null)}
            >
                <DialogTitle>Подтверждение удаления</DialogTitle>
                <DialogContent>
                    <Typography>
                        Вы уверены, что хотите удалить этот отзыв? Это действие нельзя отменить.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(null)}>
                        Отмена
                    </Button>
                    <Button 
                        onClick={() => handleDeleteReview(deleteDialog)} 
                        color="error"
                        variant="contained"
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ReviewsPage;