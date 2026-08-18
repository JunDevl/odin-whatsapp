-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "MessageSeenByUser" (
    "messageId" TEXT NOT NULL,
    "recieverUserId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageSeenByUser_pkey" PRIMARY KEY ("messageId","recieverUserId")
);

-- AddForeignKey
ALTER TABLE "MessageSeenByUser" ADD CONSTRAINT "MessageSeenByUser_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSeenByUser" ADD CONSTRAINT "MessageSeenByUser_recieverUserId_fkey" FOREIGN KEY ("recieverUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
