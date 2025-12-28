-- Performance Indexes Migration
-- These indexes optimize common query patterns for better database performance

-- Salon composite indexes for filtered queries
CREATE INDEX IF NOT EXISTS "Salon_approvalStatus_city_idx" ON "Salon"("approvalStatus", "city");
CREATE INDEX IF NOT EXISTS "Salon_approvalStatus_visibilityWeight_idx" ON "Salon"("approvalStatus", "visibilityWeight");
CREATE INDEX IF NOT EXISTS "Salon_offersMobile_idx" ON "Salon"("offersMobile");

-- Service composite indexes for filtered queries
CREATE INDEX IF NOT EXISTS "Service_salonId_approvalStatus_idx" ON "Service"("salonId", "approvalStatus");
CREATE INDEX IF NOT EXISTS "Service_categoryId_approvalStatus_idx" ON "Service"("categoryId", "approvalStatus");

-- Product indexes for listings and filtering
CREATE INDEX IF NOT EXISTS "Product_approvalStatus_idx" ON "Product"("approvalStatus");
CREATE INDEX IF NOT EXISTS "Product_sellerId_approvalStatus_idx" ON "Product"("sellerId", "approvalStatus");

