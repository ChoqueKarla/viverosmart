const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { audit } = require('../services/auditService');
const { getSectorAccess } = require('../services/sectorAccessService');

async function listCrops(req, res) {
  try {
    const access = await getSectorAccess(prisma, req.user.id);
    if (!access) return res.status(401).json({ error: 'La cuenta ya no está disponible.' });
    const where = access.isAdmin ? {} : { sectorId: { in: access.sectorIds } };
    res.json(await prisma.crop.findMany({ where, include: { sector: true, user: { select: { id: true, name: true } } }, orderBy: { id: 'desc' } }));
  }
  catch (error) { res.status(500).json({ error: error.message }); }
}

async function createCrop(req, res) {
  try {
    const { name, species, stage, growthPercent, sectorId, userId } = req.body;
    if (!name || !sectorId) return res.status(400).json({ error: 'Nombre y sector son obligatorios.' });
    const crop = await prisma.crop.create({ data: { name, species, stage, growthPercent: Number(growthPercent || 0), sectorId: Number(sectorId), userId: userId ? Number(userId) : null } });
    await audit(req.user.id, 'CREATE_CROP', { id: crop.id, name: crop.name }); res.status(201).json(crop);
  } catch (error) { res.status(400).json({ error: 'No se pudo crear el cultivo.' }); }
}

async function updateCrop(req, res) {
  try { const crop = await prisma.crop.update({ where: { id: Number(req.params.id) }, data: req.body }); await audit(req.user.id, 'UPDATE_CROP', { id: crop.id }); res.json(crop); }
  catch (error) { res.status(400).json({ error: 'No se pudo actualizar el cultivo.' }); }
}

async function deleteCrop(req, res) {
  try { await prisma.crop.delete({ where: { id: Number(req.params.id) } }); await audit(req.user.id, 'DELETE_CROP', { id: Number(req.params.id) }); res.status(204).end(); }
  catch (error) { res.status(404).json({ error: 'Cultivo no encontrado.' }); }
}

async function getMyCrops(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ error: 'La cuenta ya no está disponible. Inicia sesión nuevamente.' });
    }

    const [crops, simulatorPlants] = await Promise.all([
      prisma.crop.findMany({
        where: { userId: req.user.id },
        include: { sector: true }
      }),
      // Plant es la colección que usa el simulador.
      prisma.plant.findMany({ 
        where: { userId: req.user.id },
        include: { sector: true },
        orderBy: { createdAt: 'desc' } 
      })
    ]);

    const mappedSimulatorPlants = simulatorPlants.map(plant => ({
      id: `simulator-${plant.id}`,
      name: plant.name,
      species: plant.species,
      stage: 'Registrada en simulador',
      growthPercent: 0,
      sector: plant.sector,
      source: 'SIMULATOR'
    }));

    // Combinamos cultivos y plantas del simulador para la vista Mis Plantas
    res.json([...crops, ...mappedSimulatorPlants]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getMyCrops, listCrops, createCrop, updateCrop, deleteCrop };
