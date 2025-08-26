import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import svgTs from 'vite-plugin-svg-ts';

export default defineConfig({
	plugins: [
		sveltekit(),
		svgTs({
			svgFolderPath: './src/lib/icons',
		}),
	],
});
