-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Module" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 1,
    "courseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slidesUrl" TEXT,
    "slidesTitle" TEXT,
    CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Module" ("courseId", "createdAt", "description", "id", "order", "title") SELECT "courseId", "createdAt", "description", "id", "order", "title" FROM "Module";
DROP TABLE "Module";
ALTER TABLE "new_Module" RENAME TO "Module";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
