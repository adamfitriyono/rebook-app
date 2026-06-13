const prisma = require('../config/database');

const DEFAULTS = {
  serviceFee: 2500,
  shippingFee: 12000,
};

let cache = { ...DEFAULTS, loadedAt: 0 };
const CACHE_TTL_MS = 30_000;

async function loadSettings() {
  if (Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return { serviceFee: cache.serviceFee, shippingFee: cache.shippingFee };
  }

  const rows = await prisma.platformSetting.findMany({
    where: { key: { in: ['serviceFee', 'shippingFee'] } },
  });

  const next = { ...DEFAULTS };
  rows.forEach((row) => {
    const num = parseInt(row.value, 10);
    if (!Number.isNaN(num) && num >= 0) next[row.key] = num;
  });

  cache = { ...next, loadedAt: Date.now() };
  return { serviceFee: cache.serviceFee, shippingFee: cache.shippingFee };
}

async function getPlatformFees() {
  return loadSettings();
}

async function updatePlatformFees(adminId, { serviceFee, shippingFee }) {
  const updates = [];
  if (serviceFee !== undefined) {
    const val = Math.max(0, parseInt(serviceFee, 10));
    if (Number.isNaN(val)) throw new Error('serviceFee invalid');
    updates.push({ key: 'serviceFee', value: String(val) });
  }
  if (shippingFee !== undefined) {
    const val = Math.max(0, parseInt(shippingFee, 10));
    if (Number.isNaN(val)) throw new Error('shippingFee invalid');
    updates.push({ key: 'shippingFee', value: String(val) });
  }

  await Promise.all(
    updates.map(({ key, value }) =>
      prisma.platformSetting.upsert({
        where: { key },
        create: { key, value, updatedBy: adminId },
        update: { value, updatedBy: adminId },
      }),
    ),
  );

  cache.loadedAt = 0;
  return getPlatformFees();
}

function invalidateCache() {
  cache.loadedAt = 0;
}

module.exports = {
  DEFAULTS,
  getPlatformFees,
  updatePlatformFees,
  invalidateCache,
};
