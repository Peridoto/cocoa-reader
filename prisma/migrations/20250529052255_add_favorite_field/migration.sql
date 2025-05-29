-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
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
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "keyPoints" TEXT,
    "readingTime" INTEGER,
    "sentiment" TEXT,
    "primaryCategory" TEXT,
    "categories" TEXT,
    "tags" TEXT,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Article" ("aiProcessed", "categories", "cleanedHTML", "createdAt", "domain", "excerpt", "id", "keyPoints", "primaryCategory", "read", "readingTime", "scroll", "sentiment", "summary", "tags", "textContent", "title", "url") SELECT "aiProcessed", "categories", "cleanedHTML", "createdAt", "domain", "excerpt", "id", "keyPoints", "primaryCategory", "read", "readingTime", "scroll", "sentiment", "summary", "tags", "textContent", "title", "url" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");
CREATE INDEX "Article_read_idx" ON "Article"("read");
CREATE INDEX "Article_domain_idx" ON "Article"("domain");
CREATE INDEX "Article_favorite_idx" ON "Article"("favorite");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
