-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL,
    "platformName" TEXT NOT NULL DEFAULT 'SaaS Support Platform',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@example.com',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 8,
    "passwordRequireSpecialChar" BOOLEAN NOT NULL DEFAULT true,
    "passwordRequireNumber" BOOLEAN NOT NULL DEFAULT true,
    "passwordRequireUppercase" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorAuthRequired" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 60,
    "twilioAccountSid" TEXT,
    "twilioAuthToken" TEXT,
    "twilioApiKey" TEXT,
    "twilioApiSecret" TEXT,
    "stripePublishableKey" TEXT,
    "stripeSecretKey" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUsername" TEXT,
    "smtpPassword" TEXT,
    "emailFromName" TEXT,
    "emailFromAddress" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
