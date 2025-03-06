/*
  Warnings:

  - Changed the type of `key` on the `configuration` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ConfigurationKey" AS ENUM ('year');

-- AlterTable
ALTER TABLE "configuration" DROP COLUMN "key",
ADD COLUMN     "key" "ConfigurationKey" NOT NULL;
