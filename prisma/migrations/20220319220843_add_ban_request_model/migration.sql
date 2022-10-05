-- CreateTable
CREATE TABLE "BanRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "reason" TEXT DEFAULT E'N/A',
    "daysToDelete" INTEGER DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT[],

    CONSTRAINT "BanRequest_pkey" PRIMARY KEY ("id")
);
