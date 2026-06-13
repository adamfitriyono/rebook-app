const prisma = require('../config/database');

async function logAdminAction(adminId, action, { entityType, entityId, details } = {}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        entityType: entityType || null,
        entityId: entityId ?? null,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error('Failed to write admin audit log:', err.message);
  }
}

module.exports = { logAdminAction };
