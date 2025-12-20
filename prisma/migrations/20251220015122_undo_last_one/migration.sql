/*
  Warnings:

  - You are about to drop the `AccessLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Visitor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccessLog" DROP CONSTRAINT "AccessLog_visitor_id_fkey";

-- DropTable
DROP TABLE "AccessLog";

-- DropTable
DROP TABLE "Visitor";
