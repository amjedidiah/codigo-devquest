/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "solana-web3": ["@solana/web3.js"], // For reduced build chunk size
        },
      },
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/vitest-setup.ts",
    deps: {
      optimizer: {
        web: {
          include: ["vitest-canvas-mock"],
        },
      },
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
