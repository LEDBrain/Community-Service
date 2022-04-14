/*
  Warnings:

  - You are about to drop the column `roleAmount` on the `ReactionRoleMessage` table. All the data in the column will be lost.
  - Added the required column `name` to the `ReactionRoleMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReactionRoleMessage" DROP COLUMN "roleAmount",
ADD COLUMN     "assignableRoleAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "name" TEXT NOT NULL;
