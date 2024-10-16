/*
  Warnings:

  - Added the required column `updatedAt` to the `VectorizedItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VectorizedItem" ADD COLUMN     "book" TEXT,
ADD COLUMN     "collection" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "translation" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verse" TEXT;
