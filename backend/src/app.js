
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Inicializar base de datos
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const plantRoutes = require('./routes/plantRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const apiRoutes = require('./routes/apiRoutes');

// Iniciar cron jobs
require('./jobs/cron');
require('./jobs/archive');

const { ensurePermissions } = require('./controllers/roleController');

ensurePermissions().catch(error =>
  console.error(
    'No se pudieron inicializar los permisos:',
    error.message
  )
);

const app = express();

// ======================================================
// CORS
// ======================================================

const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://viverosmart-frontend-alb-1642573275.us-east-1.elb.amazonaws.com',
  'https://main.d2gry3pkizcub6.amplifyapp.com',
]);

const corsOptions = {
  origin(origin, callback) {
    console.log('CORS Origin recibido:', origin);

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    if (/^http:\/\/\d{1,3}(\.\d{1,3}){3}$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

// ======================================================
// RATE LIMITING
// ======================================================

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  message: {
    error:
      'Demasiadas peticiones desde esta IP. Inténtalo de nuevo en 15 minutos.',
  },
});

// Límite de autenticación.
// Se deja definido para poder utilizarlo en operaciones
// sensibles posteriormente, pero NO se aplica a todo
// /api/auth porque setup-status se consulta automáticamente.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  message: {
    error:
      'Demasiados intentos fallidos. Bloqueado temporalmente por seguridad.',
  },
});

app.use('/api/', limiter);

// ======================================================
// RUTAS
// ======================================================

// Autenticación
app.use('/api/auth', authRoutes);

// Plantas protegidas
app.use(
  '/api/plantas',
  authMiddleware,
  plantRoutes
);

// API Smart
app.use('/api/smart', apiRoutes);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: 'ok',
    });
  } catch (error) {
    console.error(
      'Health check falló:',
      error.message
    );

    return res.status(503).json({
      status: 'unavailable',
    });
  }
});

// ======================================================
// SERVIDOR
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Backend de Vivero Inteligente corriendo en puerto ${PORT}`
  );
});

