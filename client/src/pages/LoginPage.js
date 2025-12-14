import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import AuthForm from '../components/AuthForm';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();

    const handleSuccess = (userData) => {
        console.log('Login successful:', userData);
        navigate('/');
    };

    return (
        <Container maxWidth="sm">
            <Box my={4}>
                <Typography variant="h4" align="center" gutterBottom>
                    Вход в систему
                </Typography>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <AuthForm mode="login" onSuccess={handleSuccess} />
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;