# vite-plugin-svg-ts

[![npm](https://img.shields.io/npm/v/vite-plugin-svg-ts.svg)](https://www.npmjs.com/package/vite-plugin-svg-ts)

## Waku Setup

Assuming you’ve already completed [Step1 and Step2](https://github.com/rayrw/vite-plugin-svg-ts), continue with the following:

### Step3-1: Install SVGR Vite plugin

This plugin (vite-plugin-svg-ts) does **not** transform SVG files into React components by itself.
For that, you’ll need an additional Vite plugin — [`vite-plugin-svgr`](https://www.npmjs.com/package/vite-plugin-svgr), which has been tested to work during development.

```bash
npm install --save-dev vite-plugin-svgr
```

### Step3-2: Register the plugins in `waku.config.ts`

Update your `waku.config.ts` to include both `vite-plugin-svgr` and `vite-plugin-svg-ts`.
This modifies the underlying Vite configuration used by Waku.

```ts
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
```

### Step3-3. Update TypeScript config

Add the generated type definition to your `tsconfig.json` so that TypeScript picks it up:

```json
{
	"compilerOptions": {
		"strict": true,
		"target": "esnext",
		"noEmit": true,
		"isolatedModules": true,
		"moduleDetection": "force",
		"downlevelIteration": true,
		"esModuleInterop": true,
		"module": "esnext",
		"moduleResolution": "bundler",
		"skipLibCheck": true,
		"noUncheckedIndexedAccess": true,
		"exactOptionalPropertyTypes": true,
		"jsx": "react-jsx"
	},
	// Add the following line
	"include": ["src", ".svg-ts/virtual-module.d.ts"]
}
```

### Step3-4: Keep CI builds working

Since `.svg-ts` is ignored by Git, you’ll need to regenerate types in CI.
Add the CLI command `svg-ts` to your `package.json` `prepare` scripts:

```json
{
	"scripts": {
		"prepare": "svg-ts"
	}
}
```

## Example: React Icon Component

Here’s how you can use the generated types and virtual module inside a React component:

```tsx
import svgs from 'virtual:svg-ts';
import type { SvgName } from 'virtual:svg-ts';

interface Props {
	name: SvgName;
}

export function Icon({ name }: Props) {
	const Svg = svgs[name];
	return (
		<span>
			<Svg />
		</span>
	);
}
```

Usage with autocompletion:

```tsx
<!-- ✅ Autocompletion works here:
     typing name="..." will suggest only valid SVG names,
     e.g. "arrow-left" | "arrow-right" | "home" -->
<Icon name="home" />

<!-- ❌ Invalid names will be type-checked by TS:
<Icon name="house" /> // error: Type '"house"' is not assignable to type 'SvgName'
-->
```
