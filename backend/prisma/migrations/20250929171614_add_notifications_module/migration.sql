-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ACCOUNT_REGISTERED', 'BUSINESS_PROFILE_COMPLETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_REPLACED', 'PAYMENT_REMINDER', 'CHECKLIST_READY', 'GENERIC');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('UNREAD', 'READ');

-- CreateEnum
CREATE TYPE "public"."NotificationEmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "readAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailStatus" "public"."NotificationEmailStatus" NOT NULL DEFAULT 'PENDING',
    "emailSentAt" TIMESTAMP(3),
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "public"."Notification"("userId", "status");

-- CreateIndex
CREATE INDEX "Notification_emailStatus_idx" ON "public"."Notification"("emailStatus");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
