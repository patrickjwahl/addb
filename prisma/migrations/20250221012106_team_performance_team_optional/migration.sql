-- DropForeignKey
ALTER TABLE "team_performances" DROP CONSTRAINT "team_performances_team_id_fkey";

-- AlterTable
ALTER TABLE "team_performances" ALTER COLUMN "team_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "team_performances" ADD CONSTRAINT "team_performances_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
