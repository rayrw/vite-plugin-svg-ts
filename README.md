# vite-plugin-svg-ts

Load `.svg` files from a folder with **auto-generated TypeScript types** based on their file names.

https://github.com/user-attachments/assets/2e6d7537-07a1-48ee-b9b3-5c2959535080

## Motivation

This plugin was inspired by SvelteKit’s [generated types](https://svelte.dev/docs/kit/types#Generated-types).
I wanted a way to load an entire folder of SVG files **with autocompletion for file names**, making icon imports more type-safe and developer-friendly.

## How It Works

When you add this plugin:

1. **File scanning** – It scans all `.svg` files inside the folder you specify (`svgFolderPath`).
2. **Virtual module generation** – At build time, it creates a virtual module (`virtual:svg-ts`) containing:
   * An object mapping each file name → raw SVG string (other methods coming soon).
   * A TypeScript type (`SvgName`) with all valid file names.
3. **Types output** – It writes the `.d.ts` file into `.svg-ts/virtual-module.d.ts`.
   This file is used by your editor to provide **autocompletion and type-checking** when referencing icons.

Example: If you have `arrow-left.svg` and `arrow-right.svg` in your folder, the generated type file will be:

```ts
declare module "virtual:svg-ts" {
  export type SvgName =
    | 'arrow-left'
    | 'arrow-right'
  const svgs: Record<SvgName, string>;
  export default svgs;
}
```

And you can safely reference them in your code with autocomplete.

## Installation

```bash
npm install --save-dev vite-plugin-svg-ts
```

Add the plugin to your `vite.config.ts` and specify the folder containing your SVG files:

```ts
import { defineConfig } from 'vite';
import svgTs from 'vite-plugin-svg-ts';

export default defineConfig({
  plugins: [
    svgTs({
      svgFolderPath: './src/lib/icons',
    }),
  ],
});
```

The plugin generates types in the `.svg-ts` folder at the project root.
It’s recommended to **add this folder to `.gitignore` and formatter config file:**

```
.svg-ts
```

## SvelteKit Setup

### 1. Update TypeScript config

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

### 2. Keep CI builds working

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

## Roadmap / Todo

* Add support for other frameworks
* Allow customizing the output path for generated types
* Explore ways to optimize SVG files automatically
