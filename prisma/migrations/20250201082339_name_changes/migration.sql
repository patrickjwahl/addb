/*
  Warnings:

  - You are about to drop the `Edit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventSchedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Region` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `State` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StudentPerformance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamPerformance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Edit" DROP CONSTRAINT "Edit_userId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_eventScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_regionId_fkey";

-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_stateId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Region" DROP CONSTRAINT "Region_stateId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPerformance" DROP CONSTRAINT "StudentPerformance_matchId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPerformance" DROP CONSTRAINT "StudentPerformance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPerformance" DROP CONSTRAINT "StudentPerformance_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "TeamPerformance" DROP CONSTRAINT "TeamPerformance_matchId_fkey";

-- DropForeignKey
ALTER TABLE "TeamPerformance" DROP CONSTRAINT "TeamPerformance_teamId_fkey";

-- DropTable
DROP TABLE "Edit";

-- DropTable
DROP TABLE "EventSchedule";

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "Person";

-- DropTable
DROP TABLE "Region";

-- DropTable
DROP TABLE "School";

-- DropTable
DROP TABLE "State";

-- DropTable
DROP TABLE "StudentPerformance";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamPerformance";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "search1" TEXT NOT NULL,
    "search2" TEXT NOT NULL,
    "search3" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "round" "Round" NOT NULL,
    "region_id" INTEGER,
    "state_id" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "site" TEXT,
    "has_sq" BOOLEAN NOT NULL DEFAULT false,
    "incomplete_data" BOOLEAN NOT NULL DEFAULT false,
    "has_divisions" BOOLEAN NOT NULL DEFAULT false,
    "access" INTEGER NOT NULL,
    "event_schedule_id" INTEGER NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_schedules" (
    "id" SERIAL NOT NULL,
    "math" BOOLEAN NOT NULL DEFAULT true,
    "music" BOOLEAN NOT NULL DEFAULT true,
    "econ" BOOLEAN NOT NULL DEFAULT true,
    "science" BOOLEAN NOT NULL DEFAULT true,
    "lit" BOOLEAN NOT NULL DEFAULT true,
    "art" BOOLEAN NOT NULL DEFAULT true,
    "social_science" BOOLEAN NOT NULL DEFAULT true,
    "essay" BOOLEAN NOT NULL DEFAULT true,
    "speech" BOOLEAN NOT NULL DEFAULT true,
    "interview" BOOLEAN NOT NULL DEFAULT true,
    "objs" BOOLEAN NOT NULL DEFAULT true,
    "subs" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "event_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_performances" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "math" TEXT,
    "music" TEXT,
    "econ" TEXT,
    "science" TEXT,
    "lit" TEXT,
    "art" TEXT,
    "social_science" TEXT,
    "essay" TEXT,
    "speech" TEXT,
    "interview" TEXT,
    "overall" TEXT NOT NULL,
    "objs" TEXT,
    "subs" TEXT,

    CONSTRAINT "student_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_performances" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "overall" TEXT NOT NULL,
    "objs" TEXT,
    "subs" TEXT,
    "division" TEXT,
    "sq" TEXT,

    CONSTRAINT "team_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state_id" INTEGER NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "states" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passhash" TEXT NOT NULL,
    "access" INTEGER NOT NULL,
    "can_edit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edits" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "prev" TEXT,
    "new" TEXT,

    CONSTRAINT "edits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "matches_event_schedule_id_key" ON "matches"("event_schedule_id");

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_event_schedule_id_fkey" FOREIGN KEY ("event_schedule_id") REFERENCES "event_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_performances" ADD CONSTRAINT "student_performances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_performances" ADD CONSTRAINT "student_performances_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_performances" ADD CONSTRAINT "student_performances_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_performances" ADD CONSTRAINT "team_performances_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_performances" ADD CONSTRAINT "team_performances_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "edits" ADD CONSTRAINT "edits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
