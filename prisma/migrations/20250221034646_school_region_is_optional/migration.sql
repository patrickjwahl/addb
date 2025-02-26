-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_region_id_fkey";

-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "region_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
