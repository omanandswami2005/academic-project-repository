const express = require('express');
const router = express.Router();
const checkDBConnection = require('../middleware/checkDB');
const {
    signup,
    login,
    updatePassword,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth.controller');

router.post('/signup', checkDBConnection, signup);
router.post('/login', checkDBConnection, login);
router.post('/update-password', checkDBConnection, updatePassword);
router.post('/forgot-password', checkDBConnection, forgotPassword);
router.post('/reset-password/:token', checkDBConnection, resetPassword);

module.exports = router;
