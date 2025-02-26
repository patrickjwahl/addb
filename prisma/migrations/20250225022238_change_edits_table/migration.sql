/*
  Warnings:

  - You are about to drop the column `new` on the `edits` table. All the data in the column will be lost.
  - You are about to drop the column `prev` on the `edits` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "edits" DROP COLUMN "new",
DROP COLUMN "prev",
ADD COLUMN     "diff" TEXT;
