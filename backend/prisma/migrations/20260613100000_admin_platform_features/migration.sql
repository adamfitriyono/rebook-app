-- AlterTable Review: moderation
ALTER TABLE "Review" ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable PromoBanner
CREATE TABLE "PromoBanner" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "cta" TEXT NOT NULL DEFAULT 'Lihat',
    "link" TEXT NOT NULL DEFAULT '/catalog',
    "imageUrl" TEXT,
    "bgGradient" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable ReviewReport
CREATE TABLE "ReviewReport" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable Dispute
CREATE TABLE "Dispute" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable AdminAuditLog
CREATE TABLE "AdminAuditLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" INTEGER,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable PlatformSetting
CREATE TABLE "PlatformSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewReport_reviewId_idx" ON "ReviewReport"("reviewId");
CREATE INDEX "ReviewReport_status_idx" ON "ReviewReport"("status");
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");
CREATE INDEX "Dispute_orderId_idx" ON "Dispute"("orderId");
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
CREATE UNIQUE INDEX "PlatformSetting_key_key" ON "PlatformSetting"("key");

-- AddForeignKey
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default platform settings
INSERT INTO "PlatformSetting" ("key", "value", "updatedAt") VALUES
  ('serviceFee', '2500', CURRENT_TIMESTAMP),
  ('shippingFee', '12000', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

-- Seed default promo banners
INSERT INTO "PromoBanner" ("title", "subtitle", "cta", "link", "imageUrl", "bgGradient", "sortOrder", "active", "updatedAt") VALUES
  ('Buku Lama, Ilmu Baru', 'Hemat 40–60% untuk buku bekas berkualitas', 'Jelajahi Katalog', '/catalog', 'https://picsum.photos/seed/rebook-promo1/1200/400', 'linear-gradient(135deg, #8CC63E 0%, #6BA832 100%)', 0, true, CURRENT_TIMESTAMP),
  ('Grading Transparan', 'Kondisi buku terverifikasi: Seperti Baru, Bagus, Cukup', 'Lihat Produk', '/catalog?condition=like_new', 'https://picsum.photos/seed/rebook-promo2/1200/400', 'linear-gradient(135deg, #1E2838 0%, #028090 100%)', 1, true, CURRENT_TIMESTAMP),
  ('Mulai Berjualan', 'Daftar sebagai penjual dan jangkau pembaca di seluruh Indonesia', 'Daftar Sekarang', '/register', 'https://picsum.photos/seed/rebook-promo3/1200/400', 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', 2, true, CURRENT_TIMESTAMP);
