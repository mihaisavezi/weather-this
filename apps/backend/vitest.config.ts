import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    test: {
      environment: "node",
      globals: true,
      testTimeout: 10000,
      // Make environment variables available to tests
      env: env,
    },
    // Ensure dotenv is processed
    define: {
      "process.env": env,
    },
  };
});
