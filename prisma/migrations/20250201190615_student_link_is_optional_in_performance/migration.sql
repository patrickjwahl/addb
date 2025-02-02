-- DropForeignKey
ALTER TABLE "student_performances" DROP CONSTRAINT "student_performances_student_id_fkey";

-- AlterTable
ALTER TABLE "student_performances" ALTER COLUMN "student_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "student_performances" ADD CONSTRAINT "student_performances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
