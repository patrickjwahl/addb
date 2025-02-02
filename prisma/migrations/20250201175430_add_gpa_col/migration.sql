/*
  Warnings:

  - Added the required column `gpa` to the `student_performances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_performances" ADD COLUMN     "gpa" TEXT NOT NULL;
