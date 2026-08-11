import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dos builds separados a partir del mismo código:
// - modo "admin" (Vercel): admin.html -> dist-admin, incluye entry-data/ (carga y edición de datos).
// - cualquier otro modo (VPS, default): index.html -> dist-public, solo la calculadora pública.
// Al ser entradas Rollup distintas con outDir distintos, el build público no
// termina con ni un archivo del código de admin.
export default defineConfig(({ mode }) => {
  const esAdmin = mode === "admin";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    build: {
      outDir: esAdmin ? "dist-admin" : "dist-public",
      rollupOptions: {
        input: path.resolve(import.meta.dirname, esAdmin ? "admin.html" : "index.html"),
      },
    },
  };
});
