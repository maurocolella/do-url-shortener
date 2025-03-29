import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.VITE_PORT || 5173;

export default defineConfig({
  e2e: {
    baseUrl: `http://localhost:${port}`,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
