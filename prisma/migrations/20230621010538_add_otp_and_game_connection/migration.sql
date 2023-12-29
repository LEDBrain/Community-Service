/*
  Warnings:

  - Changed the type of `expires_at` on the `DiscordToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DiscordToken" DROP COLUMN "expires_at",
ADD COLUMN     "expires_at" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "GameAccount" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "discordUserId" TEXT,

    CONSTRAINT "GameAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "gameAccountName" TEXT NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameAccount_name_key" ON "GameAccount"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_gameAccountName_key" ON "OTP"("gameAccountName");

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_gameAccountName_fkey" FOREIGN KEY ("gameAccountName") REFERENCES "GameAccount"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
