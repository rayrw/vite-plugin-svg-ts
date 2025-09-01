import path from 'node:path';
import fs from 'node:fs';

/**
 * @typedef Options
 * @type {object}
 * @property {string} svgFolderPath
 * @property {'?raw' | '?react' | (string & Record<never, never>)} importQuery
 */

/**
 * Returns the Vite plugin.
 * @param {Options} options
 * @returns {import('vite').Plugin & { svgTsOptions: Options}}
 */
export default function svgTs(options) {
	const { svgFolderPath, importQuery } = options;
	const pluginName = 'svg-ts';
	const virtualModuleId = `virtual:${pluginName}`;
	const resolvedVirtualModuleId = '\0' + virtualModuleId;

	if (!svgFolderPath) {
		throw new Error('svgFolderPath is not specified.');
	}

	const handledImportQuery = importQuery || '?raw';
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
		configureServer({ watcher, environments }) {
			/**
			 * Sync the types once when starting the dev server.
			 */
			syncTypes(svgFolderFullPath);

			/**
			 * Sync the types and virtual module whenever svg file changes are detected.
			 */
			watcher.on('all', (_, file) => {
				if (file.startsWith(svgFolderFullPath) && /\.svg$/.test(file)) {
					syncTypes(svgFolderFullPath);

					/**
					 * Reload the virtual module to include new changes
					 */
					for (const environment of Object.values(environments)) {
						const module = environment.moduleGraph.getModuleById(
							resolvedVirtualModuleId,
						);
						if (module) {
							environment.reloadModule(module);
						}
					}
				}
			});
		},
		resolveId(id) {
			if (id === virtualModuleId) {
				return resolvedVirtualModuleId;
			}
		},
		load(id) {
			if (id === resolvedVirtualModuleId) {
				const svgFiles = fs
					.readdirSync(svgFolderFullPath, { recursive: true })
					.filter(isSvgFilePath);

				const declaration = 'const svgs = {};';

				const imports = svgFiles.map(
					(file, index) =>
						`import { default as svg$${index} } from '${svgFolderFullPath}/${file}${handledImportQuery}';`,
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
		.readdirSync(svgFolderFullPath, { recursive: true })
		.filter(isSvgFilePath)
		.map((file) => `\t\t| '${convertSvgName(file)}'`);
	const code = typeUnion.length === 0 ? 'never' : '\n' + typeUnion.join('\n');
	const content = `declare module "virtual:svg-ts" {
  export type SvgName = ${code}
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
 * Check if the entry returned by readdirSync is a svg file path
 * @param {string | Buffer<ArrayBufferLike>} file
 * @returns {file is string}
 */
const isSvgFilePath = (file) =>
	typeof file === 'string' && file.endsWith('.svg');

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
