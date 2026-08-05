-- CreateTable
CREATE TABLE "ipc_entries" (
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "ipc" DOUBLE PRECISION NOT NULL,
    "inflacion_mensual" DOUBLE PRECISION NOT NULL,
    "inflacion_interanual" DOUBLE PRECISION,
    "promedio_anual_ipc" DOUBLE PRECISION,
    "variacion_interanual_promedio" DOUBLE PRECISION,

    CONSTRAINT "ipc_entries_pkey" PRIMARY KEY ("anio","mes")
);
