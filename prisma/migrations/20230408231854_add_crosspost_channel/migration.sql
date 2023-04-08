-- AlterTable
ALTER TABLE "GuildSettings" ADD COLUMN     "crosspostChannels" TEXT[] DEFAULT ARRAY[]::TEXT[];
