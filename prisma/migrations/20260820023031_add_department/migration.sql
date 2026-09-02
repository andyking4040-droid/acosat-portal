-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "credits" INTEGER NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'Computer Science',
    "status" TEXT NOT NULL DEFAULT 'open',
    "lecturerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Course_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("code", "createdAt", "credits", "description", "id", "lecturerId", "status", "title") SELECT "code", "createdAt", "credits", "description", "id", "lecturerId", "status", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
