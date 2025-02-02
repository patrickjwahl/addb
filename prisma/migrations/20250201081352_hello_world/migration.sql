-- CreateEnum
CREATE TYPE "Round" AS ENUM ('ROUND_ONE', 'REGIONALS', 'STATE', 'NATIONALS');

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "search1" TEXT NOT NULL,
    "search2" TEXT NOT NULL,
    "search3" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "round" "Round" NOT NULL,
    "regionId" INTEGER,
    "stateId" INTEGER,
    "date" TIMESTAMP(3) NOT NULL,
    "site" TEXT,
    "hasSq" BOOLEAN NOT NULL DEFAULT false,
    "incompleteData" BOOLEAN NOT NULL DEFAULT false,
    "hasDivisions" BOOLEAN NOT NULL DEFAULT false,
    "access" INTEGER NOT NULL,
    "eventScheduleId" INTEGER NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSchedule" (
    "id" SERIAL NOT NULL,
    "math" BOOLEAN NOT NULL DEFAULT true,
    "music" BOOLEAN NOT NULL DEFAULT true,
    "econ" BOOLEAN NOT NULL DEFAULT true,
    "science" BOOLEAN NOT NULL DEFAULT true,
    "lit" BOOLEAN NOT NULL DEFAULT true,
    "art" BOOLEAN NOT NULL DEFAULT true,
    "socialScience" BOOLEAN NOT NULL DEFAULT true,
    "essay" BOOLEAN NOT NULL DEFAULT true,
    "speech" BOOLEAN NOT NULL DEFAULT true,
    "interview" BOOLEAN NOT NULL DEFAULT true,
    "objs" BOOLEAN NOT NULL DEFAULT true,
    "subs" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPerformance" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "math" TEXT,
    "music" TEXT,
    "econ" TEXT,
    "science" TEXT,
    "lit" TEXT,
    "art" TEXT,
    "socialScience" TEXT,
    "essay" TEXT,
    "speech" TEXT,
    "interview" TEXT,
    "overall" TEXT NOT NULL,
    "objs" TEXT,
    "subs" TEXT,

    CONSTRAINT "StudentPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamPerformance" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "overall" TEXT NOT NULL,
    "objs" TEXT,
    "subs" TEXT,
    "division" TEXT,
    "sq" TEXT,

    CONSTRAINT "TeamPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "stateId" INTEGER NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passhash" TEXT NOT NULL,
    "access" INTEGER NOT NULL,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "prev" TEXT,
    "new" TEXT,

    CONSTRAINT "Edit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Match_eventScheduleId_key" ON "Match"("eventScheduleId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_eventScheduleId_fkey" FOREIGN KEY ("eventScheduleId") REFERENCES "EventSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPerformance" ADD CONSTRAINT "StudentPerformance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPerformance" ADD CONSTRAINT "StudentPerformance_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPerformance" ADD CONSTRAINT "StudentPerformance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPerformance" ADD CONSTRAINT "TeamPerformance_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPerformance" ADD CONSTRAINT "TeamPerformance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edit" ADD CONSTRAINT "Edit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
