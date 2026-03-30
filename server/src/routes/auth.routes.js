const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updatePasswordSchema,
    refreshTokenSchema,
} = require('../validators/schemas');
const {
    signup,
    login,
    refresh,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
} = require('../controllers/auth.controller');

router.post('/signup', validate({ body: signupSchema }), signup);
router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh', validate({ body: refreshTokenSchema }), refresh);
router.post('/logout', logout);
router.patch('/update-password', authenticate, validate({ body: updatePasswordSchema }), updatePassword);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password/:token', validate({ body: resetPasswordSchema }), resetPassword);

module.exports = router;
