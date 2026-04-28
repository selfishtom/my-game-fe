import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  build: {
    outDir: "dist",
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
  },
  resolve: {
    tsconfigPaths: true,
  },
});
