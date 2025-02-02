/*
  Warnings:

  - You are about to drop the column `teamId` on the `students` table. All the data in the column will be lost.
  - Added the required column `team_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_teamId_fkey";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "teamId",
ADD COLUMN     "team_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
