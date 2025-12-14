import React, { Component } from 'react';
import { Paper, Button, Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Hotel, Assignment } from '@mui/icons-material';

// Классовый компонент для сложной логики распределения номеров
class RoomAllocation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRoom: '',
            guestName: props.guestName || '',
            allocating: false,
            allocated: false
        };
    }

    // Обработчик события: изменение выбранного номера
    handleRoomChange = (event) => {
        this.setState({ selectedRoom: event.target.value });
    };

    // Обработчик события: назначение номера
    handleRoomAssign = () => {
        if (!this.state.selectedRoom) {
            alert('Выберите номер');
            return;
        }

        this.setState({ allocating: true });
        
        setTimeout(() => {
            this.setState({ allocating: false, allocated: true });
            if (this.props.onRoomAssign) {
                this.props.onRoomAssign({
                    room: this.state.selectedRoom,
                    guest: this.state.guestName,
                    timestamp: new Date()
                });
            }
        }, 1500);
    };

    // Жизненный цикл: componentDidMount
    componentDidMount() {
        console.log('RoomAllocation mounted');
    }

    // Жизненный цикл: componentDidUpdate
    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedRoom !== this.state.selectedRoom) {
            console.log('Room changed:', this.state.selectedRoom);
        }
    }

    render() {
        const { rooms = [], guestName } = this.props;
        const { selectedRoom, allocating, allocated } = this.state;

        return (
            <Paper sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                    <Hotel sx={{ mr: 1 }} />
                    <Typography variant="h6">Распределение номеров</Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" mb={2}>
                    Гость: {guestName}
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Выберите номер</InputLabel>
                    <Select
                        value={selectedRoom}
                        onChange={this.handleRoomChange}
                        label="Выберите номер"
                        disabled={allocating || allocated}
                    >
                        {rooms.map((room) => (
                            <MenuItem key={room._id || room.roomNumber} value={room.roomNumber}>
                                {room.roomNumber} - {room.categoryName} ({room.capacity} чел.)
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={this.handleRoomAssign}
                    disabled={!selectedRoom || allocating || allocated}
                    startIcon={<Assignment />}
                >
                    {allocating ? 'Назначение...' : allocated ? 'Номер назначен' : 'Назначить номер'}
                </Button>

                {allocated && (
                    <Typography variant="body2" color="success.main" mt={2}>
                        Номер {selectedRoom} успешно назначен
                    </Typography>
                )}
            </Paper>
        );
    }
}

RoomAllocation.defaultProps = {
    rooms: [],
    guestName: 'Гость'
};

export default RoomAllocation;
