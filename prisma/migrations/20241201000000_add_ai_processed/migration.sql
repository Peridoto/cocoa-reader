-- Add aiProcessed column to Article table
ALTER TABLE "Article" ADD COLUMN "aiProcessed" BOOLEAN NOT NULL DEFAULT false;
