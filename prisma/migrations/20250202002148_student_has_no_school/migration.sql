/*
  Warnings:

  - You are about to drop the column `school_id` on the `students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_school_id_fkey";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "school_id";
