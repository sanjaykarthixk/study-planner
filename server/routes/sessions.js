const express = require('express');
const router = express.Router();
const { getSessions, createSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/',  getSessions);
router.post('/', createSession);

module.exports = router;