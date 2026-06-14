const prisma = require('../config/database');
const { safeDeleteProduct } = require('../utils/productDelete');
const { computeSellerRating, formatProduct, formatProductsWithSellerRatings, computeSellerRatingsBatch, parseDiscountPercent, parseShippingSpecs, parseOptionalInt, parseOptionalDecimal, sellerPublicSelect } = require('../utils/productHelpers');
const { getLikeCounts, getLikedProductIdSet, getProductLikeCount, attachLikeCounts, attachLikedByMe } = require('../utils/likeHelpers');
const { validateCategoryName } = require('./categoryController');
const { uploadImages, DEFAULT_PRODUCT_IMAGE } = require('../utils/cloudinaryUpload');

exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { category, condition, search, sort = 'newest' } = req.query;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;

    const where = { available: true };

    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (condition) where.condition = condition;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          seller: { select: sellerPublicSelect },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const ratingMap = await computeSellerRatingsBatch(prisma, products.map((p) => p.sellerId));
    let formatted = formatProductsWithSellerRatings(products, ratingMap);
    const likeCountMap = await getLikeCounts(prisma, products.map((p) => p.id));
    formatted = attachLikeCounts(formatted, likeCountMap);

    if (req.user?.id) {
      const likedIds = await getLikedProductIdSet(prisma, req.user.id, products.map((p) => p.id));
      formatted = attachLikedByMe(formatted, likedIds);
    }

    if (sort === 'rating') {
      formatted = formatted.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { ...sellerPublicSelect, phoneNumber: true } },
        reviews: {
          where: { hidden: false },
          include: { author: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    prisma.product
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    const sellerRating = await computeSellerRating(prisma, product.sellerId);
    const formatted = formatProduct(product, sellerRating);
    formatted.likeCount = await getProductLikeCount(prisma, id);

    if (req.user?.id) {
      const liked = await prisma.wishlistItem.findUnique({
        where: { userId_productId: { userId: req.user.id, productId: id } },
      });
      formatted.likedByMe = Boolean(liked);
    }

    formatted.reviews = product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      authorId: r.author.id,
      author: r.author.fullName,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { title, author, isbn, description, condition, price, category, stock, discountPercent } = req.body;

    if (!title || !description || !condition || !price || !category) {
      return res.status(400).json({ success: false, error: 'Invalid input data' });
    }

    const categoryValid = await validateCategoryName(category);
    if (!categoryValid) {
      return res.status(400).json({ success: false, error: 'Kategori tidak valid' });
    }

    const parsedDiscount = parseDiscountPercent(discountPercent);
    if (parsedDiscount === undefined) {
      return res.status(400).json({ success: false, error: 'Hemat harus angka 0–99' });
    }

    const shipping = parseShippingSpecs(req.body);
    if (shipping.error) {
      return res.status(400).json({ success: false, error: shipping.error });
    }

    const images = req.files?.length
      ? await uploadImages(req.files, 'products')
      : [DEFAULT_PRODUCT_IMAGE];

    const product = await prisma.product.create({
      data: {
        title,
        author: author || null,
        isbn: isbn?.trim() || null,
        description,
        condition,
        price: parseFloat(price),
        category,
        stock: parseInt(stock, 10) || 1,
        discountPercent: parsedDiscount,
        ...shipping.data,
        sellerId: req.user.id,
        images,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { ...product, price: Number(product.price) },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'You can only update your own products' });
    }

    const { title, author, isbn, description, condition, price, category, stock, available, discountPercent, weightGram, lengthCm, widthCm, heightCm } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (author !== undefined) updateData.author = author;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (description) updateData.description = description;
    if (condition) updateData.condition = condition;
    if (price) updateData.price = parseFloat(price);
    if (category) {
      const categoryValid = await validateCategoryName(category);
      if (!categoryValid) {
        return res.status(400).json({ success: false, error: 'Kategori tidak valid' });
      }
      updateData.category = category;
    }
    if (stock !== undefined && stock !== '') {
      const parsedStock = parseInt(stock, 10);
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({ success: false, error: 'Stok harus angka 0 atau lebih' });
      }
      updateData.stock = parsedStock;
      if (parsedStock === 0) {
        updateData.available = false;
      } else if (product.stock === 0) {
        updateData.available = true;
      }
    }
    if (available !== undefined) updateData.available = available === 'true' || available === true;
    if (discountPercent !== undefined) {
      const parsedDiscount = parseDiscountPercent(discountPercent);
      if (parsedDiscount === undefined) {
        return res.status(400).json({ success: false, error: 'Hemat harus angka 0–99' });
      }
      updateData.discountPercent = parsedDiscount;
    }

    if (weightGram !== undefined) {
      const parsed = parseOptionalInt(weightGram, { max: 50000 });
      if (parsed === undefined) {
        return res.status(400).json({ success: false, error: 'Berat paket harus angka 0–50000 gram' });
      }
      updateData.weightGram = parsed;
    }
    if (lengthCm !== undefined) {
      const parsed = parseOptionalDecimal(lengthCm);
      if (parsed === undefined) {
        return res.status(400).json({ success: false, error: 'Panjang paket tidak valid' });
      }
      updateData.lengthCm = parsed;
    }
    if (widthCm !== undefined) {
      const parsed = parseOptionalDecimal(widthCm);
      if (parsed === undefined) {
        return res.status(400).json({ success: false, error: 'Lebar paket tidak valid' });
      }
      updateData.widthCm = parsed;
    }
    if (heightCm !== undefined) {
      const parsed = parseOptionalDecimal(heightCm);
      if (parsed === undefined) {
        return res.status(400).json({ success: false, error: 'Tinggi paket tidak valid' });
      }
      updateData.heightCm = parsed;
    }

    const MAX_IMAGES = 5;
    if (req.body.existingImages !== undefined || req.files?.length > 0) {
      let kept = product.images;
      if (req.body.existingImages !== undefined) {
        try {
          const parsed = JSON.parse(req.body.existingImages);
          if (!Array.isArray(parsed)) {
            return res.status(400).json({ success: false, error: 'existingImages tidak valid' });
          }
          kept = parsed.filter((url) => typeof url === 'string' && url.trim());
        } catch {
          return res.status(400).json({ success: false, error: 'existingImages tidak valid' });
        }
      }

      const newUploads = req.files?.length ? await uploadImages(req.files, 'products') : [];
      const merged = [...kept, ...newUploads].slice(0, MAX_IMAGES);

      if (merged.length === 0) {
        return res.status(400).json({ success: false, error: 'Produk harus memiliki minimal 1 foto' });
      }
      if (kept.length + newUploads.length > MAX_IMAGES) {
        return res.status(400).json({ success: false, error: `Maksimal ${MAX_IMAGES} foto` });
      }

      updateData.images = merged;
    }

    const updated = await prisma.product.update({ where: { id }, data: updateData });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { ...updated, price: Number(updated.price) },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    if (product.sellerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'You can only delete your own products' });
    }

    await safeDeleteProduct(prisma, id);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getMyListings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const { status = 'all' } = req.query;

    const where = { sellerId: req.user.id };
    if (status === 'active') where.available = true;
    if (status === 'sold_out') where.stock = 0;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { reviews: { select: { rating: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    const data = products.map((p) => ({
      ...formatProduct({ ...p, seller: null }),
      stock: p.stock,
      sold: p.sold,
    }));

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  const { getPublicCategories } = require('./categoryController');
  return getPublicCategories(req, res, next);
};
