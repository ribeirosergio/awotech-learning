import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import { readSupabaseConfig } from './src/lib/supabase-config.ts';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  readSupabaseConfig(
    loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_'),
  );
  return {
    plugins: [react(), tailwindcss()],
    server: { host: '127.0.0.1' },
    build: {
      rolldownOptions: {
        output: {
          strictExecutionOrder: true,
          codeSplitting: {
            groups: [
              {
                name: 'monaco',
                test: /monaco-editor/,
                maxSize: 500_000,
                includeDependenciesRecursively: false,
              },
            ],
          },
        },
      },
    },
  };
});
