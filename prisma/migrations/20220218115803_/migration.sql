-- CreateEnum
CREATE TYPE "SanctionType" AS ENUM ('BAN', 'KICK', 'MUTE', 'UNMUTE', 'WARN');

-- CreateTable
CREATE TABLE "GuildSettings" (
    "id" TEXT NOT NULL,
    "logChannelId" TEXT NOT NULL DEFAULT E'',
    "muteRoleId" TEXT NOT NULL DEFAULT E'',
    "disabledCommands" TEXT[],

    CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sanction" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "reason" TEXT DEFAULT E'N/A',
    "type" "SanctionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT[],
    "sanctioning_end" TIMESTAMP(3),
    "terminatedBy" INTEGER,

    CONSTRAINT "Sanction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_terminatedBy_fkey" FOREIGN KEY ("terminatedBy") REFERENCES "Sanction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
