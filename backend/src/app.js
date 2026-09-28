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
ensurePermissions().catch(error => console.error('No se pudieron inicializar los permisos:', error.message));

const app = express();

// 2. CORS Restringido (Vulnerabilidad #2 parchada)
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  // Vite puede abrir el mismo servidor de desarrollo con cualquiera de
  // estas direcciones; ambas deben poder alcanzar la API local.
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// 1. Rate Limiting (Vulnerabilidad #1 parchada)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita a 100 peticiones por IP cada 15 min
  message: { error: 'Demasiadas peticiones desde esta IP. Inténtalo de nuevo en 15 minutos.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Más estricto para rutas de login/registro (10 intentos)
  message: { error: 'Demasiados intentos fallidos. Bloqueado temporalmente por seguridad.' }
});

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

app.use('/api/plantas', authMiddleware, plantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/smart', apiRoutes);

// Kubernetes y los balanceadores usan esta ruta para comprobar que la API y
// su conexión con PostgreSQL están disponibles antes de enviarle tráfico.
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    return res.status(503).json({ status: 'unavailable' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend de Vivero Inteligente corriendo en puerto ${PORT}`);
});
