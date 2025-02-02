/*
  Warnings:

  - You are about to drop the column `regionId` on the `schools` table. All the data in the column will be lost.
  - Added the required column `region_id` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_regionId_fkey";

-- AlterTable
ALTER TABLE "schools" DROP COLUMN "regionId",
ADD COLUMN     "region_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
