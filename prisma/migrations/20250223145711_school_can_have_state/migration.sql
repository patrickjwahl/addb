-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "state_id" INTEGER;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
