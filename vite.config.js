import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],

    // Si tu React está en la raíz del dominio, déjalo así:
    base: "/",

    // Para que .js también pueda contener JSX sin reventar Vite:
    esbuild: {
      loader: "jsx",
      include: /src\/.*\.[jt]sx?$/, // aplica a js, jsx, ts, tsx dentro de src
      exclude: [],
    },

    // Carpeta final que subirás a cPanel (estándar: dist)
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },

    // Solo para que en dev no te tape todo el overlay rojo (opcional)
    server: {
      hmr: {
        overlay: false,
      },
    },
  };
});
