# vite-plugin-svg-ts

[![npm](https://img.shields.io/npm/v/vite-plugin-svg-ts.svg)](https://www.npmjs.com/package/vite-plugin-svg-ts)

## SvelteKit Setup

Assuming you’ve already completed [Step1 and Step2](https://github.com/rayrw/vite-plugin-svg-ts), continue with the following:

### Step3-1: Register the plugin to `vite.config.ts`

Add the plugin to your `vite.config.ts` and specify the folder containing your SVG files and the import query:

```ts
import { defineConfig } from 'vite';
import svgTs from 'vite-plugin-svg-ts';

export default defineConfig({
	plugins: [
		svgTs({
			svgFolderPath: './src/lib/icons',
			importQuery: '?raw', // ?raw for Svelte or '?react' for React
		}),
	],
});
```

### Step3-2: Update TypeScript config

In your `svelte.config.js`, extend the TypeScript configuration to include the generated virtual module type:

```ts
const config = {
	kit: {
		// ...

		typescript: {
			config: (config) => {
				return {
					...config,
					include: [...config.include, '../.svg-ts/virtual-module.d.ts'],
				};
			},
		},
	},
};

export default config;
```

### Step3-3: Keep CI builds working

Since `.svg-ts` is ignored by Git, you’ll need to regenerate types in CI.
Add the CLI command `svg-ts` to your `package.json` scripts (similar to how SvelteKit handles its generated types):

```json
{
	"scripts": {
		"prepare": "svg-ts && svelte-kit sync || echo ''",
		"check": "svg-ts && svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svg-ts && svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
	}
}
```

## Example: Svelte Icon Component

Here’s how you can use the generated types and virtual module inside a Svelte component:

```svelte
<script lang="ts">
	import svg from 'virtual:svg-ts';
	import type { SvgName } from 'virtual:svg-ts';

	export let name: SvgName;
</script>

<!-- eslint-disable svelte/no-at-html-tags -->
<span>
	{@html svg[name]}
</span>

<style>
	span {
		color: #000;
	}

	span > :global(svg) {
		width: 80px;
		height: 80px;
	}
</style>
```

```svelte
<script lang="ts">
	import Icon from '$lib/Icon.svelte';
</script>

<!-- ✅ Autocompletion works here:
     typing name="..." will suggest only valid SVG names,
     e.g. "arrow-left" | "arrow-right" | "home" -->
<Icon name="home" />

<!-- ❌ Invalid names will be type-checked by TS:
<Icon name="house" /> // error: Type '"house"' is not assignable to type 'SvgName'
-->
```
