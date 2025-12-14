import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import RoomList from '../components/RoomList';
import { authService } from '../services/authService';

const HomePage = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    
    return (
        <Container maxWidth="lg" className="hospitality-container">
            <Box my={4} className="hospitality-fade-in">
                <Typography variant="h2" component="h1" gutterBottom align="center" className="hospitality-accent">
                    Добро пожаловать в Гостиницу "Престиж"
                </Typography>
                
                <Typography variant="h5" color="text.secondary" paragraph align="center">
                    Лучший отдых в самом центре города
                </Typography>
                
                {/* Информация о времени (требование задания) */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">
                                Дата и время (UTC):
                            </Typography>
                            <Typography variant="body1">
                                {new Date().toISOString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">
                                Дата и время (локальное):
                            </Typography>
                            <Typography variant="body1">
                                {new Date().toLocaleString('ru-RU')}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2">
                                Ваша временная зона:
                            </Typography>
                            <Typography variant="body1">
                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
                
                {/* Кнопки для навигации */}
                <Box display="flex" gap={2} justifyContent="center" mb={4}>
                    {user ? (
                        <>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                component={Link} 
                                to="/profile"
                                className="hospitality-button"
                            >
                                Мой профиль
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                component={Link} 
                                to="/rooms"
                                className="hospitality-button"
                            >
                                Все номера
                            </Button>
                            <Button 
                                variant="outlined" 
                                component={Link} 
                                to="/bookings"
                                className="hospitality-button"
                            >
                                Мои бронирования
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                component={Link} 
                                to="/login"
                                className="hospitality-button"
                            >
                                Войти
                            </Button>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                component={Link} 
                                to="/register"
                                className="hospitality-button"
                            >
                                Регистрация
                            </Button>
                            <Button 
                                variant="text" 
                                component={Link} 
                                to="/rooms"
                                className="hospitality-button"
                            >
                                Посмотреть номера
                            </Button>
                        </>
                    )}
                </Box>
                
                {/* Список номеров в grid */}
                <Box className="hospitality-grid">
                    <RoomList 
                        userRole={user?.role || 'client'}
                        onRoomSelect={(roomId) => {
                            if (user) {
                                navigate(`/room/${roomId}`);
                            } else {
                                window.location.href = '/login';
                            }
                        }}
                    />
                </Box>
            </Box>
        </Container>
    );
};

export default HomePage;