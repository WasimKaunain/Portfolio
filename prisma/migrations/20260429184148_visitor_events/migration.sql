-- CreateTable
CREATE TABLE "VisitorEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "tz" TEXT,
    "lang" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,

    CONSTRAINT "VisitorEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisitorEvent_createdAt_idx" ON "VisitorEvent"("createdAt");

-- CreateIndex
CREATE INDEX "VisitorEvent_country_idx" ON "VisitorEvent"("country");
