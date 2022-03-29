-- AlterTable
ALTER TABLE "BanRequest" ADD COLUMN     "isRejected" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "BanRequest" ADD CONSTRAINT "BanRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanRequest" ADD CONSTRAINT "BanRequest_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
