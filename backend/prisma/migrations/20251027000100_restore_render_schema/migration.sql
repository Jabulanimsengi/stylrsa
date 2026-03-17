-- Restore schema parity with the original hosted database
-- Generated via `prisma migrate diff`

-- DropForeignKey
ALTER TABLE "public"."Promotion" DROP CONSTRAINT "Promotion_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Promotion" DROP CONSTRAINT "Promotion_serviceId_fkey";

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "originalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "promotionalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "salonId" TEXT,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "salonOwnerRespondedAt" TIMESTAMP(3),
ADD COLUMN     "salonOwnerResponse" TEXT;

-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "bookingMessage" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountLockedUntil" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "twoFactorBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT,
ADD COLUMN     "verificationExpires" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- CreateTable
CREATE TABLE "BeforeAfterPhoto" (
    "id" TEXT NOT NULL,
    "beforeImageUrl" TEXT NOT NULL,
    "afterImageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "serviceId" TEXT,

    CONSTRAINT "BeforeAfterPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceVideo" (
    "id" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "vimeoId" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER NOT NULL,
    "caption" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "salonId" TEXT NOT NULL,
    "serviceId" TEXT,

    CONSTRAINT "ServiceVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeforeAfterPhoto_salonId_idx" ON "BeforeAfterPhoto"("salonId");

-- CreateIndex
CREATE INDEX "BeforeAfterPhoto_serviceId_idx" ON "BeforeAfterPhoto"("serviceId");

-- CreateIndex
CREATE INDEX "BeforeAfterPhoto_approvalStatus_idx" ON "BeforeAfterPhoto"("approvalStatus");

-- CreateIndex
CREATE INDEX "BeforeAfterPhoto_createdAt_idx" ON "BeforeAfterPhoto"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceVideo_vimeoId_key" ON "ServiceVideo"("vimeoId");

-- CreateIndex
CREATE INDEX "ServiceVideo_salonId_idx" ON "ServiceVideo"("salonId");

-- CreateIndex
CREATE INDEX "ServiceVideo_serviceId_idx" ON "ServiceVideo"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceVideo_approvalStatus_idx" ON "ServiceVideo"("approvalStatus");

-- CreateIndex
CREATE INDEX "ServiceVideo_createdAt_idx" ON "ServiceVideo"("createdAt");

-- CreateIndex
CREATE INDEX "ServiceVideo_views_idx" ON "ServiceVideo"("views");

-- CreateIndex
CREATE INDEX "Promotion_approvalStatus_idx" ON "Promotion"("approvalStatus");

-- CreateIndex
CREATE INDEX "Promotion_salonId_idx" ON "Promotion"("salonId");

-- CreateIndex
CREATE INDEX "Promotion_serviceId_idx" ON "Promotion"("serviceId");

-- CreateIndex
CREATE INDEX "Promotion_productId_idx" ON "Promotion"("productId");

-- CreateIndex
CREATE INDEX "Promotion_endDate_idx" ON "Promotion"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_verificationToken_idx" ON "User"("verificationToken");

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeforeAfterPhoto" ADD CONSTRAINT "BeforeAfterPhoto_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeforeAfterPhoto" ADD CONSTRAINT "BeforeAfterPhoto_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVideo" ADD CONSTRAINT "ServiceVideo_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceVideo" ADD CONSTRAINT "ServiceVideo_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
