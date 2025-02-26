/*
  Warnings:

  - The `objs` column on the `team_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subs` column on the `team_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `overall` on the `team_performances` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "team_performances" DROP COLUMN "overall",
ADD COLUMN     "overall" DOUBLE PRECISION NOT NULL,
DROP COLUMN "objs",
ADD COLUMN     "objs" DOUBLE PRECISION,
DROP COLUMN "subs",
ADD COLUMN     "subs" DOUBLE PRECISION;
