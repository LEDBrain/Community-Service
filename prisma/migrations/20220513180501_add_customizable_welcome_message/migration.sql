-- AlterTable
ALTER TABLE "GuildSettings" ADD COLUMN     "welcomeMessage" TEXT NOT NULL DEFAULT E'Welcome to {{servername}} {{username}}! Enjoy your stay!';
