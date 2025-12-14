const express = require('express');
const router = express.Router();

// Временный маршрут для теста
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'User routes are under construction'
    });
});

module.exports = router;