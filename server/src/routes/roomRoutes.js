const express = require('express');
const router = express.Router();
const {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms
} = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

// Публичные маршруты
router.get('/', getRooms);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoomById);

// Защищенные маршруты (только для администраторов)
router.post('/', protect, admin, createRoom);
router.put('/:id', protect, admin, updateRoom);
router.delete('/:id', protect, admin, deleteRoom);

module.exports = router;