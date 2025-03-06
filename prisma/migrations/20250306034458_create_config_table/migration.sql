-- CreateTable
CREATE TABLE "configuration" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "strValue" TEXT NOT NULL,
    "numValue" INTEGER NOT NULL,

    CONSTRAINT "configuration_pkey" PRIMARY KEY ("id")
);
