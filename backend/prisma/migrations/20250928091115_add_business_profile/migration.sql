-- CreateEnum
CREATE TYPE "public"."BusinessType" AS ENUM ('FOOD_BEVERAGE', 'TECH_STARTUP', 'SERVICES', 'MANUFACTURING', 'RETAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."BusinessScale" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "public"."PermitType" AS ENUM ('HALAL', 'PIRT', 'BPOM');

-- CreateTable
CREATE TABLE "public"."BusinessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" "public"."BusinessType" NOT NULL,
    "businessScale" "public"."BusinessScale" NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "industryTags" TEXT[],
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BusinessPermitProfile" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "permitType" "public"."PermitType" NOT NULL,
    "formData" JSONB,
    "fieldChecklist" JSONB,
    "documents" JSONB,
    "isChecklistComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPermitProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_userId_key" ON "public"."BusinessProfile"("userId");

-- CreateIndex
CREATE INDEX "BusinessPermitProfile_permitType_idx" ON "public"."BusinessPermitProfile"("permitType");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPermitProfile_businessProfileId_permitType_key" ON "public"."BusinessPermitProfile"("businessProfileId", "permitType");

-- AddForeignKey
ALTER TABLE "public"."BusinessProfile" ADD CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BusinessPermitProfile" ADD CONSTRAINT "BusinessPermitProfile_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "public"."BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
