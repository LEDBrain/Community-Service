-- CreateTable
CREATE TABLE "ReactionRoleMessage" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "ReactionRoleMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleToEmoji" (
    "id" SERIAL NOT NULL,
    "roleId" TEXT NOT NULL,
    "emojiId" TEXT NOT NULL,
    "reactionRoleMessageId" INTEGER,

    CONSTRAINT "RoleToEmoji_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoleToEmoji" ADD CONSTRAINT "RoleToEmoji_reactionRoleMessageId_fkey" FOREIGN KEY ("reactionRoleMessageId") REFERENCES "ReactionRoleMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
