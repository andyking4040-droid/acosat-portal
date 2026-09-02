-- CreateTable
CREATE TABLE "LibraryResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
