/*
  Warnings:

  - Made the column `team_id` on table `team_performances` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "team_performances" DROP CONSTRAINT "team_performances_team_id_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_school_id_fkey";

-- AlterTable
ALTER TABLE "team_performances" ALTER COLUMN "team_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "school_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_performances" ADD CONSTRAINT "team_performances_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
