const prisma = require('../config/database');

function formatAddress(row) {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipientName,
    phoneNumber: row.phoneNumber,
    address: row.address,
    city: row.city,
    province: row.province,
    postalCode: row.postalCode,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function syncUserAddressFromDefault(userId, tx = prisma) {
  const defaultAddr = await tx.savedAddress.findFirst({
    where: { userId, isDefault: true },
    orderBy: { updatedAt: 'desc' },
  });

  await tx.user.update({
    where: { id: userId },
    data: defaultAddr
      ? {
          address: defaultAddr.address,
          city: defaultAddr.city,
          province: defaultAddr.province,
          postalCode: defaultAddr.postalCode,
        }
      : {
          address: null,
          city: null,
          province: null,
          postalCode: null,
        },
  });
}

function validateAddressPayload(body) {
  const address = body.address?.trim();
  const city = body.city?.trim();
  const province = body.province?.trim();

  if (!address || !city || !province) {
    return { error: 'Alamat, kota, dan provinsi wajib diisi' };
  }

  return {
    label: body.label?.trim() || null,
    recipientName: body.recipientName?.trim() || null,
    phoneNumber: body.phoneNumber?.trim() || null,
    address,
    city,
    province,
    postalCode: body.postalCode?.trim() || null,
    isDefault: Boolean(body.isDefault),
  };
}

exports.getSavedAddresses = async (req, res, next) => {
  try {
    const rows = await prisma.savedAddress.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    res.json({ success: true, data: rows.map(formatAddress) });
  } catch (err) {
    next(err);
  }
};

exports.createSavedAddress = async (req, res, next) => {
  try {
    const parsed = validateAddressPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ success: false, error: parsed.error });
    }

    const existingCount = await prisma.savedAddress.count({
      where: { userId: req.user.id },
    });
    const shouldBeDefault = parsed.isDefault || existingCount === 0;

    const created = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.savedAddress.updateMany({
          where: { userId: req.user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const row = await tx.savedAddress.create({
        data: {
          userId: req.user.id,
          ...parsed,
          isDefault: shouldBeDefault,
        },
      });

      if (shouldBeDefault) {
        await syncUserAddressFromDefault(req.user.id, tx);
      }

      return row;
    });

    res.status(201).json({ success: true, data: formatAddress(created) });
  } catch (err) {
    next(err);
  }
};

exports.updateSavedAddress = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const parsed = validateAddressPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ success: false, error: parsed.error });
    }

    const existing = await prisma.savedAddress.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Alamat tidak ditemukan' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (parsed.isDefault) {
        await tx.savedAddress.updateMany({
          where: { userId: req.user.id, isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const row = await tx.savedAddress.update({
        where: { id },
        data: {
          label: parsed.label,
          recipientName: parsed.recipientName,
          phoneNumber: parsed.phoneNumber,
          address: parsed.address,
          city: parsed.city,
          province: parsed.province,
          postalCode: parsed.postalCode,
          isDefault: parsed.isDefault ? true : existing.isDefault,
        },
      });

      if (row.isDefault) {
        await syncUserAddressFromDefault(req.user.id, tx);
      }

      return row;
    });

    res.json({ success: true, data: formatAddress(updated) });
  } catch (err) {
    next(err);
  }
};

exports.deleteSavedAddress = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.savedAddress.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Alamat tidak ditemukan' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.savedAddress.delete({ where: { id } });

      if (existing.isDefault) {
        const nextDefault = await tx.savedAddress.findFirst({
          where: { userId: req.user.id },
          orderBy: { updatedAt: 'desc' },
        });

        if (nextDefault) {
          await tx.savedAddress.update({
            where: { id: nextDefault.id },
            data: { isDefault: true },
          });
        }

        await syncUserAddressFromDefault(req.user.id, tx);
      }
    });

    res.json({ success: true, message: 'Alamat dihapus' });
  } catch (err) {
    next(err);
  }
};

exports.setDefaultSavedAddress = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.savedAddress.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Alamat tidak ditemukan' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.savedAddress.updateMany({
        where: { userId: req.user.id, isDefault: true },
        data: { isDefault: false },
      });

      const row = await tx.savedAddress.update({
        where: { id },
        data: { isDefault: true },
      });

      await syncUserAddressFromDefault(req.user.id, tx);
      return row;
    });

    res.json({ success: true, data: formatAddress(updated) });
  } catch (err) {
    next(err);
  }
};
