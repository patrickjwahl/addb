-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "private_access" BOOLEAN NOT NULL DEFAULT false;
