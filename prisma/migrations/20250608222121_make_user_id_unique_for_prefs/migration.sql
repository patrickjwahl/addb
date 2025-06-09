/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `preferences` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "preferences_user_id_key" ON "preferences"("user_id");
