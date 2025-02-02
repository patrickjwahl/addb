/*
  Warnings:

  - You are about to drop the column `region` on the `schools` table. All the data in the column will be lost.
  - Added the required column `regionId` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schools" DROP COLUMN "region",
ADD COLUMN     "regionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
