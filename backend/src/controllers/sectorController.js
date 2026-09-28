const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { audit } = require('../services/auditService');

async function getAllSectors(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true, crops: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'La cuenta ya no está disponible. Inicia sesión nuevamente.' });
    }

    let whereClause = {};
    if (user.role.name !== 'Administrador') {
      const userSectorIds = [...new Set(user.crops.map(c => c.sectorId))];
      whereClause = {
        OR: [
          { id: { in: userSectorIds } },
          { userId: user.id }
        ]
      };
    }

    const sectors = await prisma.sector.findMany({ 
      where: whereClause,
      include: { crops: true, sensors: true, user: { select: { id: true, name: true, email: true } } } 
    });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createSector(req, res) {
  try {
    const { name, description, userId } = req.body;
    const sector = await prisma.sector.create({ data: { name, description, userId: userId ? parseInt(userId) : null } });
    await audit(req.user.id, 'CREATE_SECTOR', { id: sector.id, name: sector.name });
    res.json(sector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateSector(req, res) {
  try {
    const { id } = req.params;
    const { name, description, userId } = req.body;
    const sector = await prisma.sector.update({
      where: { id: parseInt(id) },
      data: { name, description, userId: userId ? parseInt(userId) : null }
    });
    await audit(req.user.id, 'UPDATE_SECTOR', { id: sector.id });
    res.json(sector);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteSector(req, res) {
  try {
    const { id } = req.params;
    await prisma.sector.delete({ where: { id: parseInt(id) } });
    await audit(req.user.id, 'DELETE_SECTOR', { id: Number(id) });
    res.json({ message: 'Sector eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAllSectors, createSector, updateSector, deleteSector };
