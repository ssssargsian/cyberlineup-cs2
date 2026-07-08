-- CreateEnum
CREATE TYPE "UtilityType" AS ENUM ('smoke', 'flash', 'molotov', 'he', 'oneway');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('t', 'ct', 'both', 'unknown');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard', 'unknown');

-- CreateEnum
CREATE TYPE "LineupStatus" AS ENUM ('draft', 'pending_review', 'published', 'rejected');

-- CreateEnum
CREATE TYPE "ImportSourceType" AS ENUM ('website', 'youtube', 'api', 'manual');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "Map" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Map_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lineup" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mapId" INTEGER NOT NULL,
    "utilityType" "UtilityType" NOT NULL,
    "side" "Side" NOT NULL DEFAULT 'unknown',
    "area" TEXT NOT NULL,
    "fromPosition" TEXT,
    "targetPosition" TEXT,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'unknown',
    "throwType" TEXT,
    "description" TEXT,
    "steps" JSONB,
    "videoUrl" TEXT,
    "previewImageUrl" TEXT,
    "aimImageUrl" TEXT,
    "positionImageUrl" TEXT,
    "tags" TEXT[],
    "aliases" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "LineupStatus" NOT NULL DEFAULT 'draft',
    "sourceName" TEXT,
    "sourceUrl" TEXT,
    "importedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lineup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "type" "ImportSourceType" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastImportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportJob" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'pending',
    "foundCount" INTEGER NOT NULL DEFAULT 0,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "normalizedQuery" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Map_name_key" ON "Map"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Map_slug_key" ON "Map"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lineup_slug_key" ON "Lineup"("slug");

-- CreateIndex
CREATE INDEX "Lineup_mapId_idx" ON "Lineup"("mapId");

-- CreateIndex
CREATE INDEX "Lineup_utilityType_idx" ON "Lineup"("utilityType");

-- CreateIndex
CREATE INDEX "Lineup_side_idx" ON "Lineup"("side");

-- CreateIndex
CREATE INDEX "Lineup_difficulty_idx" ON "Lineup"("difficulty");

-- CreateIndex
CREATE INDEX "Lineup_area_idx" ON "Lineup"("area");

-- CreateIndex
CREATE INDEX "Lineup_status_idx" ON "Lineup"("status");

-- CreateIndex
CREATE INDEX "Lineup_isVerified_idx" ON "Lineup"("isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "ImportSource_name_key" ON "ImportSource"("name");

-- CreateIndex
CREATE INDEX "ImportJob_sourceId_idx" ON "ImportJob"("sourceId");

-- CreateIndex
CREATE INDEX "ImportJob_status_idx" ON "ImportJob"("status");

-- AddForeignKey
ALTER TABLE "Lineup" ADD CONSTRAINT "Lineup_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportJob" ADD CONSTRAINT "ImportJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ImportSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
