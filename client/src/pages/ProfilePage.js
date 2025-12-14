import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    TextField,
    Button,
    Avatar,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { Person, Email, Phone, CalendarToday, Edit, Save } from '@mui/icons-material';
import { authService } from '../services/authService';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const response = await authService.getProfile();
            setUser(response.data);
            setFormData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: response.data.email,
                phoneNumber: response.data.phoneNumber,
                birthDate: response.data.birthDate ? new Date(response.data.birthDate).toISOString().split('T')[0] : ''
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            setMessage({ type: 'error', text: 'Ошибка загрузки профиля' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const response = await authService.updateProfile(formData);
            setUser(response.data);
            setMessage({ type: 'success', text: 'Профиль успешно обновлен' });
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Ошибка обновления профиля' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box my={4}>
                <Typography variant="h4" gutterBottom>
                    Мой профиль
                </Typography>

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}

                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}>
                                    <Person sx={{ fontSize: 60 }} />
                                </Avatar>
                                <Typography variant="h6">
                                    {user?.fullName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.role === 'admin' ? 'Администратор' : 
                                     user?.role === 'receptionist' ? 'Ресепшн' : 'Клиент'}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">
                                    Личная информация
                                </Typography>
                                <Button
                                    startIcon={editing ? <Save /> : <Edit />}
                                    onClick={() => editing ? handleSave() : setEditing(true)}
                                    variant={editing ? "contained" : "outlined"}
                                    disabled={loading}
                                >
                                    {editing ? 'Сохранить' : 'Редактировать'}
                                </Button>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Имя"
                                        name="firstName"
                                        value={formData.firstName || ''}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        InputProps={{
                                            startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Фамилия"
                                        name="lastName"
                                        value={formData.lastName || ''}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        InputProps={{
                                            startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Телефон"
                                        name="phoneNumber"
                                        value={formData.phoneNumber || ''}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        InputProps={{
                                            startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Дата рождения"
                                        name="birthDate"
                                        type="date"
                                        value={formData.birthDate || ''}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            {/* Отображение времени (требование задания) */}
                            <Box mt={4} p={2} bgcolor="grey.50" borderRadius={1}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Информация о времени:
                                </Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption">
                                            UTC: {new Date().toISOString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption">
                                            Локальное: {new Date().toLocaleString('ru-RU')}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption">
                                            Зона: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </Container>
    );
};

export default ProfilePage;