-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'sq';

-- AlterTable
ALTER TABLE "student_performances" ADD COLUMN     "sq" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "session" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE INDEX "IDX_session_expire" ON "session"("expire");
