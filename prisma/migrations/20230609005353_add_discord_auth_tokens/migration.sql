-- CreateTable
CREATE TABLE "DiscordToken" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscordToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DiscordToken" ADD CONSTRAINT "DiscordToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
