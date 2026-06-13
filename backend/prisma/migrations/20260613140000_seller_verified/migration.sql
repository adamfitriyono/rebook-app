-- AlterTable
ALTER TABLE "User" ADD COLUMN "sellerVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "sellerVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "sellerVerifiedBy" TEXT;
