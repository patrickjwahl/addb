-- CreateTable
CREATE TABLE "AccessLog" (
    "id" SERIAL NOT NULL,
    "visitor_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "route" TEXT NOT NULL,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "isp" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "as" TEXT NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_ip_address_key" ON "Visitor"("ip_address");

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "Visitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
