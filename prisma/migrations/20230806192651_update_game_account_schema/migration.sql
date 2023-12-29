/*
  Warnings:

  - Added the required column `game` to the `GameAccount` table without a default value. This is not possible if the table is not empty.
  - Made the column `discordUserId` on table `GameAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SupportedGames" AS ENUM ('de_DE', 'nl_NL', 'en_GB', 'en_US');

-- DropForeignKey
ALTER TABLE "GameAccount" DROP CONSTRAINT "GameAccount_discordUserId_fkey";

-- AlterTable
ALTER TABLE "DiscordToken" ALTER COLUMN "expires_at" SET DATA TYPE BIGINT;

-- AlterTable
CREATE SEQUENCE gameaccount_id_seq;
ALTER TABLE "GameAccount" ADD COLUMN     "game" "SupportedGames" NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('gameaccount_id_seq'),
ALTER COLUMN "discordUserId" SET NOT NULL;
ALTER SEQUENCE gameaccount_id_seq OWNED BY "GameAccount"."id";

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_discordUserId_fkey" FOREIGN KEY ("discordUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
