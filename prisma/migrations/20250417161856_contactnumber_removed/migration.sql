/*
  Warnings:

  - You are about to drop the column `contactNumber` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_contactNumber_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "contactNumber";
