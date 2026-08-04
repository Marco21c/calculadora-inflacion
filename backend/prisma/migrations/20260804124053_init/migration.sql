-- CreateTable
CREATE TABLE "ipc_entries" (
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "variacion_mensual" REAL NOT NULL,
    "inflacion_interanual" REAL,

    PRIMARY KEY ("anio", "mes")
);
