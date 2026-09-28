const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getWeatherState } = require('../services/weatherService');
const { generateRecommendation } = require('../services/recommendationEngine');

// Función helper para obtener estado del suelo basado en %
function getSoilStateFromMoisture(moisture) {
  if (moisture <= 10) return 'seco';
  if (moisture <= 50) return 'media';
  return 'mojado';
}

// Enumerar las plantas existentes; sus IDs no necesariamente empiezan en 1.
router.get('/', async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true } });
    if (!currentUser) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    const plants = await prisma.plant.findMany({
      where: currentUser.role.name === 'Administrador' ? { sectorId: { not: null } } : { userId: currentUser.id, sectorId: { not: null } },
      select: { id: true, name: true, species: true, lat: true, lng: true, sectorId: true, sector: { select: { id: true, name: true } } },
      orderBy: { id: 'asc' }
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
    return res.status(400).json({ error: 'El identificador de la planta no es válido.' });
  }
  next();
});

// Verifica propiedad antes de cualquier operación sobre una planta concreta.
router.use('/:id', async (req, res, next) => {
  try {
    const [plant, currentUser] = await Promise.all([
      prisma.plant.findUnique({ where: { id: Number(req.params.id) } }),
      prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true } })
    ]);
    if (!currentUser) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    if (!plant || plant.sectorId == null) return res.status(404).json({ error: 'Planta no encontrada.' });
    if (currentUser.role.name !== 'Administrador' && plant.userId !== currentUser.id) return res.status(403).json({ error: 'No tienes acceso a esta planta.' });
    next();
  } catch (error) {
    res.status(500).json({ error: 'No se pudo validar el acceso a la planta.' });
  }
});

// GET /api/plantas/:id — obtener estado actual de una planta
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const plant = await prisma.plant.findUnique({
      where: { id: parseInt(id) },
      include: {
        soilStates: { orderBy: { timestamp: 'desc' }, take: 1 },
        weatherStates: { orderBy: { timestamp: 'desc' }, take: 1 },
        recommendations: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });
    
    if (!plant) return res.status(404).json({ error: 'Planta no encontrada' });
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plantas/:id/ubicacion — actualizar el pin del mapa (lat/lng)
router.post('/:id/ubicacion', async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    
    // 1. Actualizar planta
    const plant = await prisma.plant.update({
      where: { id: parseInt(id) },
      data: { lat, lng }
    });
    
    // 2. Obtener clima según nuevas coordenadas
    const weatherStr = await getWeatherState(lat, lng);
    
    // 3. Registrar el estado del clima
    const weather = await prisma.weatherState.create({
      data: { plantId: plant.id, state: weatherStr }
    });
    
    // 4. Actualizar recomendaciones si es posible
    const latestSoil = await prisma.soilState.findFirst({
      where: { plantId: plant.id },
      orderBy: { timestamp: 'desc' }
    });
    
    if (latestSoil) {
      const recResult = generateRecommendation(latestSoil.state, weatherStr);
      await prisma.recommendation.create({
        data: {
          plantId: plant.id,
          message: recResult.message,
          urgencyLevel: recResult.urgencyLevel
        }
      });
    }

    res.json({ message: 'Ubicación y clima actualizados', plant, weather });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantas/:id/clima — obtener último estado del clima
router.get('/:id/clima', async (req, res) => {
  try {
    const { id } = req.params;
    const weather = await prisma.weatherState.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    res.json(weather || { message: 'Sin registros de clima' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantas/:id/recomendacion — obtener recomendación actual
router.get('/:id/recomendacion', async (req, res) => {
  try {
    const { id } = req.params;
    const rec = await prisma.recommendation.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    res.json(rec || { message: 'Sin recomendaciones' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plantas/:id/reportes — historial de reportes diarios
router.get('/:id/reportes', async (req, res) => {
  try {
    const { id } = req.params;
    const reportes = await prisma.dailyReport.findMany({
      where: { plantId: parseInt(id) },
      orderBy: { date: 'desc' }
    });
    res.json(reportes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plantas/:id/riego — registrar un riego manual (y de paso el estado del suelo)
router.post('/:id/riego', async (req, res) => {
  try {
    const { id } = req.params;
    // Asumimos que cuando riega, la humedad sube a 100%
    const newMoisture = 100;
    const stateStr = getSoilStateFromMoisture(newMoisture);
    
    const soilState = await prisma.soilState.create({
      data: {
        plantId: parseInt(id),
        moisturePercentage: newMoisture,
        state: stateStr
      }
    });
    
    // Obtener clima actual para generar recomendación
    const latestWeather = await prisma.weatherState.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    
    if (latestWeather) {
      const recResult = generateRecommendation(stateStr, latestWeather.state);
      await prisma.recommendation.create({
        data: {
          plantId: parseInt(id),
          message: recResult.message,
          urgencyLevel: recResult.urgencyLevel
        }
      });
    }
    
    res.json({ message: 'Riego registrado correctamente', soilState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT EXTRA: Cambiar humedad artificialmente (para probar)
router.post('/:id/simular-humedad', async (req, res) => {
  try {
    const { id } = req.params;
    const { moisturePercentage } = req.body;
    
    const stateStr = getSoilStateFromMoisture(moisturePercentage);
    
    const soilState = await prisma.soilState.create({
      data: {
        plantId: parseInt(id),
        moisturePercentage,
        state: stateStr
      }
    });

    const latestWeather = await prisma.weatherState.findFirst({
      where: { plantId: parseInt(id) },
      orderBy: { timestamp: 'desc' }
    });
    
    if (latestWeather) {
      const recResult = generateRecommendation(stateStr, latestWeather.state);
      await prisma.recommendation.create({
        data: {
          plantId: parseInt(id),
          message: recResult.message,
          urgencyLevel: recResult.urgencyLevel
        }
      });
    }

    res.json({ message: 'Humedad simulada', soilState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT EXTRA: Crear una planta
router.post('/', async (req, res) => {
  try {
    const { name, species, lat, lng, sectorId } = req.body;
    const selectedSectorId = Number(sectorId);
    if (!Number.isInteger(selectedSectorId)) return res.status(400).json({ error: 'Debes seleccionar una zona para la planta.' });
    const sector = await prisma.sector.findUnique({ where: { id: selectedSectorId } });
    if (!sector) return res.status(400).json({ error: 'La zona seleccionada no existe.' });
    if (typeof name !== 'string' || !name.trim() ||
        typeof species !== 'string' || !species.trim() ||
        !Number.isFinite(lat) || lat < -90 || lat > 90 ||
        !Number.isFinite(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Indica un nombre, una especie y coordenadas válidas.' });
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true } });
    const targetUserId = (user.role.name === 'Administrador' && req.body.userId) ? Number(req.body.userId) : req.user.id;

    const plant = await prisma.plant.create({
      data: { name: name.trim(), species: species.trim(), lat, lng, sectorId: selectedSectorId, userId: targetUserId }
    });
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar una planta del simulador y sus estados asociados.
router.delete('/:id', async (req, res) => {
  try {
    await prisma.plant.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: 'Planta no encontrada.' });
  }
});


module.exports = router;
