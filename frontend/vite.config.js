import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: command === "serve" ? ["app"] : undefined,
  },
  build: { outDir: "build" },
  test: {
    globals: true,
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
      },
    },
    setupFiles: "./src/setupTests.js",
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
}));
