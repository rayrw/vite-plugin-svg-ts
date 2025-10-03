import { defineConfig } from 'waku/config';
import svgTs from 'vite-plugin-svg-ts';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	vite: {
		plugins: [
			svgr(),
			svgTs({
				svgFolderPath: './src/icons',
				importQuery: '?react',
			}),
		],
	},
});
