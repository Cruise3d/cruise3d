import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function getViteEnv(mode: string) {
  const envRoots = [path.resolve(__dirname, '..'), __dirname];
  const merged = Object.fromEntries(
    envRoots.flatMap((dir) => Object.entries(loadEnv(mode, dir, 'VITE_'))),
  );

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('VITE_') && value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

export default defineConfig(({ mode }) => {
  const viteEnv = getViteEnv(mode);

  return {
    plugins: [react(), tailwindcss()],
    define: Object.fromEntries(
      Object.entries(viteEnv).map(([key, value]) => [
        `import.meta.env.${key}`,
        JSON.stringify(value),
      ]),
    ),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Forward /api calls to the backend during dev to avoid CORS pain
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  };
})
