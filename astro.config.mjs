// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [svelte()],

  site: "https://bluesky-home.pages.dev/",
  base: "/",
  env: {
    schema: {
      HANDLE: envField.string({ context: "client", access: "public" }),
    }
  }
});
