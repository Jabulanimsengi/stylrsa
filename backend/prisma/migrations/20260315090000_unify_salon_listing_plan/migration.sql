-- Unify salon listings onto the single PREMIUM service-provider plan.
ALTER TABLE "Salon"
  ALTER COLUMN "commissionRate" SET DEFAULT 0.0,
  ALTER COLUMN "planCode" SET DEFAULT 'PREMIUM',
  ALTER COLUMN "visibilityWeight" SET DEFAULT 5,
  ALTER COLUMN "maxListings" SET DEFAULT 9999;

UPDATE "Salon"
SET
  "planCode" = 'PREMIUM',
  "commissionRate" = 0.0,
  "visibilityWeight" = 5,
  "maxListings" = 9999,
  "planPriceCents" = 39900
WHERE
  "planCode" IS DISTINCT FROM 'PREMIUM'
  OR "commissionRate" IS DISTINCT FROM 0.0
  OR "visibilityWeight" IS DISTINCT FROM 5
  OR "maxListings" IS DISTINCT FROM 9999
  OR "planPriceCents" IS DISTINCT FROM 39900;
