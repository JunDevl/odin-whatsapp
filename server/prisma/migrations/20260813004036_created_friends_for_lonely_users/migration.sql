/*
  Warnings:

  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageToGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOfGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "MessageToGroup" DROP CONSTRAINT "MessageToGroup_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageToGroup" DROP CONSTRAINT "MessageToGroup_recieverGroupId_fkey";

-- DropForeignKey
ALTER TABLE "MessageToUser" DROP CONSTRAINT "MessageToUser_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageToUser" DROP CONSTRAINT "MessageToUser_recieverUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserOfGroup" DROP CONSTRAINT "UserOfGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "UserOfGroup" DROP CONSTRAINT "UserOfGroup_userId_fkey";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "MessageToGroup";

-- DropTable
DROP TABLE "MessageToUser";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserOfGroup";
