ALTER TABLE "Promotion"
DROP COLUMN IF EXISTS "productId";

ALTER TABLE "User"
DROP COLUMN IF EXISTS "sellerPlanCode",
DROP COLUMN IF EXISTS "sellerPlanPriceCents",
DROP COLUMN IF EXISTS "sellerPlanPaymentStatus",
DROP COLUMN IF EXISTS "sellerPlanPaymentReference",
DROP COLUMN IF EXISTS "sellerPlanProofSubmittedAt",
DROP COLUMN IF EXISTS "sellerPlanVerifiedAt",
DROP COLUMN IF EXISTS "sellerVisibilityWeight",
DROP COLUMN IF EXISTS "sellerMaxListings",
DROP COLUMN IF EXISTS "sellerWhatsapp",
DROP COLUMN IF EXISTS "sellerWebsite",
DROP COLUMN IF EXISTS "sellerBankName",
DROP COLUMN IF EXISTS "sellerBankAccountHolder",
DROP COLUMN IF EXISTS "sellerBankAccountNumber",
DROP COLUMN IF EXISTS "sellerBankBranchCode",
DROP COLUMN IF EXISTS "sellerBankAccountType",
DROP COLUMN IF EXISTS "sellerPaymentNote",
DROP COLUMN IF EXISTS "sellerBusinessName",
DROP COLUMN IF EXISTS "sellerContactPerson",
DROP COLUMN IF EXISTS "sellerContactPhone",
DROP COLUMN IF EXISTS "sellerContactEmail",
DROP COLUMN IF EXISTS "sellerPhysicalAddress",
DROP COLUMN IF EXISTS "sellerProvincesServed",
DROP COLUMN IF EXISTS "sellerApprovalStatus",
DROP COLUMN IF EXISTS "sellerProfileSubmittedAt",
DROP COLUMN IF EXISTS "sellerApprovedAt";

DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "ProductOrder" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "BeforeAfterPhoto" CASCADE;
DROP TABLE IF EXISTS "ServiceVideo" CASCADE;
DROP TABLE IF EXISTS "VideoShort" CASCADE;
DROP TABLE IF EXISTS "JobApplication" CASCADE;
DROP TABLE IF EXISTS "JobPosting" CASCADE;
DROP TABLE IF EXISTS "Candidate" CASCADE;
DROP TABLE IF EXISTS "DeletedSellerArchive" CASCADE;

DROP TYPE IF EXISTS "ProductOrderStatus";
DROP TYPE IF EXISTS "CandidateProfession";
DROP TYPE IF EXISTS "JobType";
DROP TYPE IF EXISTS "SalaryPeriod";
DROP TYPE IF EXISTS "JobApplicationStatus";
