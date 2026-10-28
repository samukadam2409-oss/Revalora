import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// If .env.local exists in the parent workspace directory, resolve envDir from there as fallback
const hasParentEnv = fs.existsSync(path.resolve(__dirname, '../.env.local'));
const hasLocalEnv = fs.existsSync(path.resolve(__dirname, '.env.local'));
const envDir = hasLocalEnv ? __dirname : hasParentEnv ? path.resolve(__dirname, '..') : __dirname;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir,
});
