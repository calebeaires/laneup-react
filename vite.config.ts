import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
// import AutoImport from "unplugin-auto-import/vite";
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		Icons({
			autoInstall: true
		})
		// AutoImport({
		//   imports: ["react", "react-router"],
		//   dirs: ["src/components", "src/components/*", "src/components/**"],
		// }),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
			'#': resolve(__dirname, './convex')
		}
	}
});
