/*
  Warnings:

  - You are about to drop the `UserOfGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserOfGroup" DROP CONSTRAINT "UserOfGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "UserOfGroup" DROP CONSTRAINT "UserOfGroup_userId_fkey";

-- DropTable
DROP TABLE "UserOfGroup";

-- CreateTable
CREATE TABLE "MemberOfGroup" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authority" "GroupAuthority" NOT NULL,

    CONSTRAINT "MemberOfGroup_pkey" PRIMARY KEY ("userId","groupId")
);

-- AddForeignKey
ALTER TABLE "MemberOfGroup" ADD CONSTRAINT "MemberOfGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberOfGroup" ADD CONSTRAINT "MemberOfGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
