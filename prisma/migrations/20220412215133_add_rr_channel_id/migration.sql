/*
  Warnings:

  - Added the required column `channelId` to the `ReactionRoleMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReactionRoleMessage" ADD COLUMN     "channelId" TEXT NOT NULL;
