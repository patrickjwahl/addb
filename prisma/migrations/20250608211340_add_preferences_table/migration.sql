-- CreateTable
CREATE TABLE "preferences" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "partition" TEXT,
    "rank" TEXT,
    "gpa" TEXT,
    "medals" BOOLEAN,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
