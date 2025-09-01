type Options = {
	svgFolderPath: string;
	importQuery?: '?raw' | '?react' | (string & Record<never, never>);
};
// FIXME: Replace any with the actual vite plugin type
declare function svgTs(opts: Options): any;
export function syncTypes(svgFolderFullPath: string): void;
export default svgTs;
