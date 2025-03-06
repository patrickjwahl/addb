/*
  Warnings:

  - You are about to drop the column `numValue` on the `configuration` table. All the data in the column will be lost.
  - You are about to drop the column `strValue` on the `configuration` table. All the data in the column will be lost.
  - Added the required column `num_value` to the `configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `str_value` to the `configuration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "configuration" DROP COLUMN "numValue",
DROP COLUMN "strValue",
ADD COLUMN     "num_value" INTEGER NOT NULL,
ADD COLUMN     "str_value" TEXT NOT NULL;
