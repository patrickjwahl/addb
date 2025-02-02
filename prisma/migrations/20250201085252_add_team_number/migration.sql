/*
  Warnings:

  - Added the required column `info` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `team_performances` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `team_performances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "info" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_performances" ADD COLUMN     "number" INTEGER NOT NULL,
ADD COLUMN     "rank" INTEGER NOT NULL;
