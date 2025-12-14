import React, { useState, useEffect } from 'react';
import {
    Grid,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Typography,
    Button,
    Paper,
    InputAdornment
} from '@mui/material';
import { Search, Sort, FilterList } from '@mui/icons-material';
import RoomCard from './RoomCard';
import { roomService } from '../services/roomService';

const RoomList = ({ onRoomSelect, userRole }) => {
    // State для комнат
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State для фильтров
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [sortBy, setSortBy] = useState('roomNumber');
    const [sortOrder, setSortOrder] = useState('asc');
    
    // Обработчик события: изменение поискового запроса
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };
    
    // Обработчик события: изменение фильтра категории
    const handleCategoryChange = (event) => {
        setCategoryFilter(event.target.value);
    };
    
    // Обработчик события: изменение сортировки
    const handleSortChange = (event) => {
        setSortBy(event.target.value);
    };
    
    // Обработчик события: изменение порядка сортировки
    const handleSortOrderChange = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };
    
    // Обработчик события: сброс фильтров
    const handleResetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setPriceRange([0, 10000]);
        setSortBy('roomNumber');
        setSortOrder('asc');
    };
    
    // Обработчик события: бронирование комнаты
    const handleBookRoom = async (roomId) => {
        console.log('Бронирование комнаты:', roomId);
        if (onRoomSelect) {
            onRoomSelect(roomId);
        }
    };
    
    // Загрузка комнат при монтировании компонента
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const response = await roomService.getRooms({
                    category: categoryFilter || undefined,
                    minPrice: priceRange[0],
                    maxPrice: priceRange[1],
                    search: searchTerm || undefined,
                    sortBy,
                    order: sortOrder
                });
                setRooms(response.data);
                setFilteredRooms(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке комнат:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchRooms();
    }, [categoryFilter, priceRange, searchTerm, sortBy, sortOrder]);
    
    // Фильтрация комнат
    useEffect(() => {
        let result = rooms;
        
        if (searchTerm) {
            result = result.filter(room =>
                room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (categoryFilter) {
            result = result.filter(room => room.category === categoryFilter);
        }
        
        setFilteredRooms(result);
    }, [rooms, searchTerm, categoryFilter]);
    
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Номера гостиницы
            </Typography>
            
            {/* Панель фильтров и поиска */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Поиск номеров"
                            variant="outlined"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={handleCategoryChange}
                                label="Категория"
                            >
                                <MenuItem value="">Все категории</MenuItem>
                                <MenuItem value="standard">Стандарт</MenuItem>
                                <MenuItem value="comfort">Комфорт</MenuItem>
                                <MenuItem value="luxury">Люкс</MenuItem>
                                <MenuItem value="suite">Апартаменты</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Сортировка</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={handleSortChange}
                                label="Сортировка"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <Sort />
                                    </InputAdornment>
                                }
                            >
                                <MenuItem value="roomNumber">По номеру</MenuItem>
                                <MenuItem value="pricePerNight">По цене</MenuItem>
                                <MenuItem value="capacity">По вместимости</MenuItem>
                                <MenuItem value="createdAt">По дате добавления</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleSortOrderChange}
                            startIcon={<FilterList />}
                        >
                            {sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
                        </Button>
                    </Grid>
                </Grid>
                
                <Box mt={2} display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                        Найдено: {filteredRooms.length} номеров
                    </Typography>
                    <Button onClick={handleResetFilters}>
                        Сбросить фильтры
                    </Button>
                </Box>
            </Paper>
            
            {/* Список комнат */}
            {loading ? (
                <Typography>Загрузка...</Typography>
            ) : filteredRooms.length === 0 ? (
                <Typography variant="h6" color="text.secondary" align="center">
                    Номера не найдены
                </Typography>
            ) : (
                <Grid container spacing={2}>
                    {filteredRooms.map((room) => (
                        <Grid 
                            item 
                            key={room._id} 
                            xs={12} 
                            sm={6} 
                            md={4} 
                            lg={3}
                            sx={{ display: 'flex' }}
                        >
                            <RoomCard 
                                room={room} 
                                onBook={handleBookRoom}
                                userRole={userRole}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default RoomList;