/*
  Warnings:

  - Added the required column `authority` to the `UserOfGroup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GroupAuthority" AS ENUM ('owner', 'admin', 'member');

-- AlterTable
ALTER TABLE "UserOfGroup" ADD COLUMN     "authority" "GroupAuthority" NOT NULL;
