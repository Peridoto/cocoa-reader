-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "excerpt" TEXT,
    "cleanedHTML" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "scroll" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "keyPoints" TEXT,
    "readingTime" INTEGER,
    "sentiment" TEXT,
    "primaryCategory" TEXT,
    "categories" TEXT,
    "tags" TEXT,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");

-- CreateIndex
CREATE INDEX "Article_read_idx" ON "Article"("read");

-- CreateIndex
CREATE INDEX "Article_domain_idx" ON "Article"("domain");
