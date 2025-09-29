-- AlterTable
ALTER TABLE "public"."BusinessProfile" ALTER COLUMN "province" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "industryTags" SET DEFAULT ARRAY[]::TEXT[];
