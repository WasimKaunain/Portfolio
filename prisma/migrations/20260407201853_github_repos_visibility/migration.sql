/*
  Warnings:

  - A unique constraint covering the columns `[githubOwner,githubRepo]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubOwner" TEXT,
ADD COLUMN     "githubRepo" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Project_githubOwner_githubRepo_key" ON "Project"("githubOwner", "githubRepo");
