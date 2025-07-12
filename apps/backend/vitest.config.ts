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
      include: [
        "src/**/*.unit.test.ts", // Include unit tests
        "src/**/*.integration.test.ts", // Include integration tests
        "src/**/*.test.ts", // Include regular tests
        "src/**/*.spec.ts", // Include spec files
      ],
    },
    // Ensure dotenv is processed
    define: {
      "process.env": env,
    },
  };
});
