import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Increase chunk size warning threshold
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor chunks for better long-term caching
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // React core — must be a single chunk
            if (id.includes("react-dom") || id.includes("react/") || id.includes("/react.js")) {
              return "react-vendor";
            }
            // UI libraries
            if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) {
              return "ui-vendor";
            }
            // Data fetching & forms
            if (id.includes("@tanstack") || id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) {
              return "query-vendor";
            }
            // Routing
            if (id.includes("wouter")) {
              return "router-vendor";
            }
            // Everything else from node_modules
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
