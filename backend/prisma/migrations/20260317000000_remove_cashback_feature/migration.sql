DROP TABLE IF EXISTS "CashbackTransaction";

DROP TYPE IF EXISTS "CashbackType";

ALTER TABLE "User"
  DROP COLUMN IF EXISTS "cashbackBalance";

ALTER TABLE "Booking"
  DROP COLUMN IF EXISTS "cashbackAmount";
