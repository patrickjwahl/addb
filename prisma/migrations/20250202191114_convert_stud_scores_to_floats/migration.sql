/*
  Warnings:

  - The `math` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `music` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `econ` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `science` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lit` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `art` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `social_science` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `essay` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `speech` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interview` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `overall` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `objs` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `subs` column on the `student_performances` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "student_performances" DROP COLUMN "math",
ADD COLUMN     "math" DOUBLE PRECISION,
DROP COLUMN "music",
ADD COLUMN     "music" DOUBLE PRECISION,
DROP COLUMN "econ",
ADD COLUMN     "econ" DOUBLE PRECISION,
DROP COLUMN "science",
ADD COLUMN     "science" DOUBLE PRECISION,
DROP COLUMN "lit",
ADD COLUMN     "lit" DOUBLE PRECISION,
DROP COLUMN "art",
ADD COLUMN     "art" DOUBLE PRECISION,
DROP COLUMN "social_science",
ADD COLUMN     "social_science" DOUBLE PRECISION,
DROP COLUMN "essay",
ADD COLUMN     "essay" DOUBLE PRECISION,
DROP COLUMN "speech",
ADD COLUMN     "speech" DOUBLE PRECISION,
DROP COLUMN "interview",
ADD COLUMN     "interview" DOUBLE PRECISION,
DROP COLUMN "overall",
ADD COLUMN     "overall" DOUBLE PRECISION,
DROP COLUMN "objs",
ADD COLUMN     "objs" DOUBLE PRECISION,
DROP COLUMN "subs",
ADD COLUMN     "subs" DOUBLE PRECISION;
