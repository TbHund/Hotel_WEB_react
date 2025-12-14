const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Публичные маршруты
router.post('/register', registerUser);
router.post('/login', loginUser);

// Защищенные маршруты
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.post('/logout', protect, logoutUser);

module.exports = router;