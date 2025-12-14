import React, { useState } from 'react';
import { Paper, Button, Typography, Box, Chip, TextField } from '@mui/material';
import { RoomService, Add } from '@mui/icons-material';

// Стрелочная функция для презентационного компонента
const ServiceManager = ({ onServiceRequest, bookingId }) => {
    const [selectedServices, setSelectedServices] = useState([]);
    const [customRequest, setCustomRequest] = useState('');
    const [requesting, setRequesting] = useState(false);

    const availableServices = [
        'Уборка номера',
        'Завтрак в номер',
        'Дополнительные полотенца',
        'Поздний выезд',
        'Трансфер',
        'Прачечная'
    ];

    // Обработчик события: выбор услуги
    const handleServiceToggle = (service) => {
        setSelectedServices(prev => 
            prev.includes(service) 
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    // Обработчик события: запрос услуги
    const handleServiceRequest = () => {
        if (selectedServices.length === 0 && !customRequest.trim()) {
            alert('Выберите услугу или введите запрос');
            return;
        }

        setRequesting(true);
        
        setTimeout(() => {
            setRequesting(false);
            if (onServiceRequest) {
                onServiceRequest({
                    bookingId,
                    services: selectedServices,
                    customRequest: customRequest.trim(),
                    timestamp: new Date()
                });
            }
            setSelectedServices([]);
            setCustomRequest('');
        }, 1000);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
                <RoomService sx={{ mr: 1 }} />
                <Typography variant="h6">Управление услугами</Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
                Доступные услуги:
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {availableServices.map((service) => (
                    <Chip
                        key={service}
                        label={service}
                        onClick={() => handleServiceToggle(service)}
                        color={selectedServices.includes(service) ? 'primary' : 'default'}
                        variant={selectedServices.includes(service) ? 'filled' : 'outlined'}
                    />
                ))}
            </Box>

            <TextField
                fullWidth
                label="Особый запрос"
                multiline
                rows={2}
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Button
                variant="contained"
                fullWidth
                onClick={handleServiceRequest}
                disabled={requesting}
                startIcon={<Add />}
            >
                {requesting ? 'Отправка...' : 'Запросить услуги'}
            </Button>
        </Paper>
    );
};

ServiceManager.defaultProps = {
    bookingId: null
};

export default ServiceManager;
