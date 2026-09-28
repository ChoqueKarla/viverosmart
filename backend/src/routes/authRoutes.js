
const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const {
  login,
  setupStatus,
  setupInitialAdmin,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');

// Límite específico para operaciones sensibles de autenticación.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Consulta informativa.
// No necesita el límite de intentos de login.
router.get('/setup-status', setupStatus);

// Operaciones sensibles protegidas.
router.post('/login', authLimiter, login);

router.post('/setup', authLimiter, setupInitialAdmin);

router.post(
  '/password-reset/request',
  authLimiter,
  requestPasswordReset
);

router.post(
  '/password-reset/confirm',
  authLimiter,
  resetPassword
);

module.exports = router;

