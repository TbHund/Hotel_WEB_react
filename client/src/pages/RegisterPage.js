import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();

    const handleSuccess = (userData) => {
        console.log('Registration successful:', userData);
        navigate('/');
    };

    return (
        <Container maxWidth="sm">
            <Box my={4}>
                <Typography variant="h4" align="center" gutterBottom>
                    Регистрация
                </Typography>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <AuthForm mode="register" onSuccess={handleSuccess} />
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterPage;