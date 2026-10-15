-- CreateTable
CREATE TABLE "File" (
    "fileId" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("messageId","fileId")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
