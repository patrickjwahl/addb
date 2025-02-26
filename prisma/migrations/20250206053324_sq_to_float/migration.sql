/*
  Warnings:

  - The `sq` column on the `team_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "team_performances" DROP COLUMN "sq",
ADD COLUMN     "sq" DOUBLE PRECISION;
