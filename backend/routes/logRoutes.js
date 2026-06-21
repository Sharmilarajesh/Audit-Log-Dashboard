const express = require('express');
const router = express.Router();
const { uploadLogs, fetchLogs } = require('../controllers/logController');

router.post('/upload', uploadLogs);
router.get('/', fetchLogs);

module.exports = router;