import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Base URL per evitare di scrivere ogni volta l'indirizzo completo
    baseUrl: 'http://localhost:3000',

    // Pattern di ricerca dei file di test (di default: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}")
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

    // Cartella di fixture, se vuoi personalizzarla
    fixturesFolder: 'cypress/fixtures',

    // File di supporto (dove puoi definire comandi personalizzati e hook globali)
    supportFile: 'cypress/support/e2e.ts',

    setupNodeEvents(on, config) {
      // Qui puoi impostare event listeners, ad esempio:
      // on('before:browser:launch', (browser, launchOptions) => { ... })
      // on('task', { ... })
      return config;
    },
  },
});