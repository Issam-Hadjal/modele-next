import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    // Without globals, Testing Library does not clean up the DOM between tests.
    globals: true,
    // e2e/ belongs to Playwright: npm run test:e2e.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
