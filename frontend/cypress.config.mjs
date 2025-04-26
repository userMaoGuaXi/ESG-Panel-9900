import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/*.{cy,spec}.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // 可在此添加前后置钩子，比如截屏、日志等
    },
  },
  component: {
    specPattern:'cypress/component/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.jsx',
    componentIndexHtml: 'cypress/support/component-index.html',
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
