-- Add seller business profile fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerBusinessName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerContactPerson" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerContactPhone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerContactEmail" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerPhysicalAddress" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerProvincesServed" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerApprovalStatus" "ApprovalStatus" DEFAULT 'PENDING';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerProfileSubmittedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sellerApprovedAt" TIMESTAMP(3);
