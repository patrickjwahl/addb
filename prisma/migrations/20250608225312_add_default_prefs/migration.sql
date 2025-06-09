/*
  Warnings:

  - Made the column `partition` on table `preferences` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rank` on table `preferences` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gpa` on table `preferences` required. This step will fail if there are existing NULL values in that column.
  - Made the column `medals` on table `preferences` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "preferences" ALTER COLUMN "partition" SET NOT NULL,
ALTER COLUMN "partition" SET DEFAULT 'overall',
ALTER COLUMN "rank" SET NOT NULL,
ALTER COLUMN "rank" SET DEFAULT 'overall',
ALTER COLUMN "gpa" SET NOT NULL,
ALTER COLUMN "gpa" SET DEFAULT 'all',
ALTER COLUMN "medals" SET NOT NULL,
ALTER COLUMN "medals" SET DEFAULT true;
