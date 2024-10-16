-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "VectorizedItem" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(3072),

    CONSTRAINT "VectorizedItem_pkey" PRIMARY KEY ("id")
);
