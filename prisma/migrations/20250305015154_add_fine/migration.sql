-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'fine';

-- AlterTable
ALTER TABLE "student_performances" ADD COLUMN     "fine" DOUBLE PRECISION;
