import React, { useState, useMemo } from 'react';
import { Paper, Button, Typography, Box, CircularProgress } from '@mui/material';
import { Face, CheckCircle } from '@mui/icons-material';

// Функциональный компонент с декларативной функцией
function FaceCheckIn({ onFaceScan, guestName = 'Гость' }) {
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);

    // Использование useMemo для оптимизации
    const scanStatus = useMemo(() => {
        if (scanned) return 'Распознано';
        if (scanning) return 'Сканирование...';
        return 'Готово к сканированию';
    }, [scanning, scanned]);

    // Обработчик события: сканирование лица
    const handleFaceScan = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setScanned(true);
            if (onFaceScan) {
                onFaceScan({ guestName, timestamp: new Date() });
            }
        }, 2000);
    };

    return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Face sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
                Регистрация по лицу
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                Гость: {guestName}
            </Typography>
            <Box mb={2}>
                {scanning ? (
                    <CircularProgress />
                ) : scanned ? (
                    <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                ) : (
                    <Box
                        sx={{
                            width: 200,
                            height: 200,
                            border: '2px dashed',
                            borderColor: 'primary.main',
                            borderRadius: 2,
                            mx: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Typography variant="body2">Область сканирования</Typography>
                    </Box>
                )}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Статус: {scanStatus}
            </Typography>
            <Button
                variant="contained"
                onClick={handleFaceScan}
                disabled={scanning || scanned}
                startIcon={<Face />}
            >
                {scanning ? 'Сканирование...' : scanned ? 'Распознано' : 'Начать сканирование'}
            </Button>
        </Paper>
    );
}

FaceCheckIn.defaultProps = {
    guestName: 'Гость'
};

export default FaceCheckIn;
