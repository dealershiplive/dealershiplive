-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "widgetAgentName" TEXT,
ADD COLUMN     "widgetColor" TEXT NOT NULL DEFAULT '#4f46e5',
ADD COLUMN     "widgetCompanyName" TEXT,
ADD COLUMN     "widgetWelcomeMessage" TEXT;
