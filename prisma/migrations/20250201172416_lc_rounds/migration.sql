/*
  Warnings:

  - The values [ROUND_ONE,REGIONALS,STATE,NATIONALS] on the enum `Round` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Round_new" AS ENUM ('round_one', 'regionals', 'state', 'nationals');
ALTER TABLE "matches" ALTER COLUMN "round" TYPE "Round_new" USING ("round"::text::"Round_new");
ALTER TYPE "Round" RENAME TO "Round_old";
ALTER TYPE "Round_new" RENAME TO "Round";
DROP TYPE "Round_old";
COMMIT;
