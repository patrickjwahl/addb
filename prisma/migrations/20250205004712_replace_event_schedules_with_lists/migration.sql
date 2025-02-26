/*
  Warnings:

  - You are about to drop the column `event_schedule_id` on the `matches` table. All the data in the column will be lost.
  - You are about to drop the `event_schedules` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('math', 'music', 'econ', 'science', 'lit', 'art', 'socialScience', 'essay', 'speech', 'interview');

-- DropForeignKey
ALTER TABLE "matches" DROP CONSTRAINT "matches_event_schedule_id_fkey";

-- DropIndex
DROP INDEX "matches_event_schedule_id_key";

-- AlterTable
ALTER TABLE "matches" DROP COLUMN "event_schedule_id",
ADD COLUMN     "events" "Category"[];

-- DropTable
DROP TABLE "event_schedules";
