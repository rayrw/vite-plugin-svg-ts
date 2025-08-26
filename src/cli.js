#!/usr/bin/env node

import { resolveConfig } from 'vite';
import path from 'node:path';
import { syncTypes } from './index.js';

async function main() {
	const config = await resolveConfig({}, 'build');

	const svgTsPluginConfig = config.plugins.find(
		({ name }) => name === 'svg-ts',
	);

	if (!svgTsPluginConfig) {
		throw new Error('cannot find svg-ts plugin from vite config');
	}

	const { svgFolderPath } =
		/**
		 * @type {import('vite').Plugin & {svgTsOptions: {svgFolderPath: string}}}
		 */
		(svgTsPluginConfig).svgTsOptions;

	if (!svgFolderPath) {
		throw new Error('cannot find svgFolderPath option');
	}

	const svgFolderFullPath = path.join(process.cwd(), svgFolderPath);

	syncTypes(svgFolderFullPath);
}

await main();
