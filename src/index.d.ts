type Options = { svgFolderPath: string }
// FIXME: Replace any with the actual vite plugin type
declare function svgTs(opts: Options): any;
export function syncTypes(svgFolderFullPath: string): void;
export default svgTs;
