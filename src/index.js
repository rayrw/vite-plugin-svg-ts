import path from 'node:path';
import fs from 'node:fs';

/**
 * Returns the Vite plugin.
 * @param {{svgFolderPath: string}} options
 * @returns {import('vite').Plugin & { svgTsOptions: {svgFolderPath: string}}}
 */
export default function svgTs(options) {
	const { svgFolderPath } = options;
	const pluginName = 'svg-ts';
	const virtualModuleId = `virtual:${pluginName}`;
	const resolvedVirtualModuleId = '\0' + virtualModuleId;

	if (!svgFolderPath) {
		throw new Error('svgFolderPath is not specified.');
	}

	const cwd = process.cwd();
	const svgFolderFullPath = path.join(cwd, svgFolderPath);

	return {
		name: pluginName,
		/**
		 * Include the options being passed to here so that the cli can get the svg folder path.
		 */
		svgTsOptions: options,
		/**
		 * Configure the dev server to listen to svg file changes and sync the types.
		 */
		configureServer({ watcher }) {
			/**
			 * Sync the types once when starting the dev server.
			 */
			syncTypes(svgFolderFullPath);

			/**
			 * Sync the types whenever svg file changes are detected.
			 */
			watcher.on('all', (_, file) => {
				if (file.startsWith(svgFolderFullPath) && /\.svg$/.test(file)) {
					syncTypes(svgFolderFullPath);
				}
			});
		},
		/**
		 * Invalidate the virtual module whenever related file changes are detected.
		 */
		hotUpdate({ modules, file }) {
			if (file.startsWith(svgFolderFullPath) && /\.svg$/.test(file)) {
				return modules.filter(({ id }) => id === resolvedVirtualModuleId);
			}
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				const svgFiles = fs
					.readdirSync(svgFolderFullPath)
					.filter((file) => file.endsWith('.svg'));

				const declaration = 'const svgs = {};';

				const imports = svgFiles.map(
					(file, index) =>
						`import { default as svg$${index} } from '${svgFolderFullPath}/${file}?raw';`,
				);

				const assignments = svgFiles.map(
					(file, index) => `svgs['${convertSvgName(file)}'] = svg$${index};`,
				);

				const code = `${imports.join('\n')}

${declaration}

${assignments.join('\n')}

export default svgs;`;
				return code;
			}
		},
		transform(code) {
			return {
				code,
				map: { mappings: '' },
			};
		},
	};
}

/**
 * Convert the svg file name to an object key.
 * @param {string} file
 */
function convertSvgName(file) {
	return file.replace(/\.svg$/, '');
}

/**
 * Sync the types of the virtual module.
 * @param {string} svgFolderFullPath
 */
export function syncTypes(svgFolderFullPath) {
	const typeUnion = fs
		.readdirSync(svgFolderFullPath)
		.filter((file) => file.endsWith('.svg'))
		.map((file) => `\t\t| '${convertSvgName(file)}'`);
	const code = typeUnion.join('\n');
	const content = `declare module "virtual:svg-ts" {
  export type SvgName =
${code}
  const svgs: Record<SvgName, string>;
  export default svgs;
}
`;
	writeIfChanged(
		path.join(process.cwd(), '.svg-ts/virtual-module.d.ts'),
		content,
	);
}

/**
 * Taken from https://github.com/sveltejs/kit/blob/%40sveltejs/package%402.5.0/packages/kit/src/core/sync/utils.js
 */

/** @type {Map<string, string>} */
const previousContents = new Map();

/**
 * @param {string} file
 * @param {string} code
 */
function writeIfChanged(file, code) {
	if (code !== previousContents.get(file)) {
		write(file, code);
	}
}

/**
 * @param {string} file
 * @param {string} code
 */
function write(file, code) {
	previousContents.set(file, code);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, code);
}
