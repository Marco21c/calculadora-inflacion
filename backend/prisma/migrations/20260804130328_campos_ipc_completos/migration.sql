/*
  Warnings:

  - You are about to drop the column `variacion_mensual` on the `ipc_entries` table. All the data in the column will be lost.
  - Added the required column `inflacion_mensual` to the `ipc_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ipc` to the `ipc_entries` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ipc_entries" (
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "ipc" REAL NOT NULL,
    "inflacion_mensual" REAL NOT NULL,
    "inflacion_interanual" REAL,
    "promedio_anual_ipc" REAL,
    "variacion_interanual_promedio" REAL,

    PRIMARY KEY ("anio", "mes")
);
INSERT INTO "new_ipc_entries" ("anio", "inflacion_interanual", "mes") SELECT "anio", "inflacion_interanual", "mes" FROM "ipc_entries";
DROP TABLE "ipc_entries";
ALTER TABLE "new_ipc_entries" RENAME TO "ipc_entries";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
