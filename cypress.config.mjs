import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1440,
  viewportHeight: 1000,
  video: false,
  screenshotOnRunFailure: true,
  scrollBehavior: "center",
  retries: { runMode: 1, openMode: 0 },
  e2e: {
    baseUrl: "http://localhost:3100",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: false,
    testIsolation: true,
  },
});
