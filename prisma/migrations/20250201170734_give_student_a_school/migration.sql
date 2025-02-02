/*
  Warnings:

  - You are about to drop the column `team_id` on the `students` table. All the data in the column will be lost.
  - Added the required column `school_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "student_performances" DROP CONSTRAINT "student_performances_match_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_performances" DROP CONSTRAINT "team_performances_match_id_fkey";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "team_id",
ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_performances" ADD CONSTRAINT "student_performances_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_performances" ADD CONSTRAINT "team_performances_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
