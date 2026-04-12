ALTER TABLE "Salon"
ADD COLUMN IF NOT EXISTS "depositRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "depositPercentage" INTEGER,
ADD COLUMN IF NOT EXISTS "paymentInstructions" TEXT,
ADD COLUMN IF NOT EXISTS "specialConditions" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'BookingWhatsAppIntent'
  ) THEN
    ALTER TABLE "BookingWhatsAppIntent"
    ADD COLUMN IF NOT EXISTS "clientEmail" TEXT;
  END IF;
END $$;
