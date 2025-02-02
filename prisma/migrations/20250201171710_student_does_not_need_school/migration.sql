-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_school_id_fkey";

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "school_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
