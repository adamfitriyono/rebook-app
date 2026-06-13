-- CreateTable
CREATE TABLE "SellerFollow" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedAddress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "label" TEXT,
    "recipientName" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerFollow_userId_idx" ON "SellerFollow"("userId");

-- CreateIndex
CREATE INDEX "SellerFollow_sellerId_idx" ON "SellerFollow"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerFollow_userId_sellerId_key" ON "SellerFollow"("userId", "sellerId");

-- CreateIndex
CREATE INDEX "SavedAddress_userId_idx" ON "SavedAddress"("userId");

-- AddForeignKey
ALTER TABLE "SellerFollow" ADD CONSTRAINT "SellerFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerFollow" ADD CONSTRAINT "SellerFollow_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAddress" ADD CONSTRAINT "SavedAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing profile addresses to SavedAddress
INSERT INTO "SavedAddress" ("userId", "label", "address", "city", "province", "postalCode", "isDefault", "createdAt", "updatedAt")
SELECT
    "id",
    'Utama',
    "address",
    "city",
    "province",
    "postalCode",
    true,
    NOW(),
    NOW()
FROM "User"
WHERE "address" IS NOT NULL
  AND TRIM("address") <> ''
  AND "city" IS NOT NULL
  AND TRIM("city") <> ''
  AND "province" IS NOT NULL
  AND TRIM("province") <> '';
