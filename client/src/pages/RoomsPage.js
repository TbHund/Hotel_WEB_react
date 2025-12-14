import React from 'react';
import { Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RoomList from '../components/RoomList';
import { authService } from '../services/authService';

const RoomsPage = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <RoomList 
                userRole={user?.role || 'client'}
                onRoomSelect={(roomId) => {
                    // Переходим на страницу деталей номера, где можно забронировать
                    navigate(`/room/${roomId}`);
                }}
            />
        </Container>
    );
};

export default RoomsPage;