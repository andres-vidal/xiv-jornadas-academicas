import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

/* En GitHub Pages la app cuelga de /<repo>/. vite-plugin-singlefile fija la base
   de los assets en "./" para poder incrustarlos, así que el basename del router
   viaja aparte, en su propio define. */
export default defineConfig({
  define: { __BASE_PATH__: JSON.stringify(process.env.BASE_PATH || "/") },
  plugins: [react(), tailwind(), viteSingleFile()],
  build: { target: "es2020", cssCodeSplit: false, assetsInlineLimit: 100000000 },
});
