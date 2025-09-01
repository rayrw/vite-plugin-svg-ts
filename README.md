# vite-plugin-svg-ts

[![npm](https://img.shields.io/npm/v/vite-plugin-svg-ts.svg)](https://www.npmjs.com/package/vite-plugin-svg-ts)

Load `.svg` files from a folder with **auto-generated TypeScript types** based on their file names.

https://github.com/user-attachments/assets/2e6d7537-07a1-48ee-b9b3-5c2959535080

## Motivation

This plugin was inspired by SvelteKit’s [generated types](https://svelte.dev/docs/kit/types#Generated-types).
I wanted a way to load an entire folder of SVG files **with autocompletion for file names**, making icon imports more type-safe and developer-friendly.

## How It Works

When you add this plugin:

1. **File scanning** – It scans all `.svg` files inside the folder you specify (`svgFolderPath`).
2. **Virtual module generation** – At build time, it creates a virtual module (`virtual:svg-ts`) containing:
   * An object mapping each file name → SVG file import resolve results (via `?raw` or `?react` query).
   * A TypeScript type (`SvgName`) with all valid SVG file names.
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

### Step1: Get the plugin from npm

```bash
npm install --save-dev vite-plugin-svg-ts
```

### Step2: Modify `.gitignore` and formatter config file

The plugin generates types in the `.svg-ts` folder at the project root.
It’s recommended to **add this folder to `.gitignore` and formatter config file:**

```
.svg-ts
```

### Step3: Framework specific setup

- [SvelteKit](https://github.com/rayrw/vite-plugin-svg-ts/tree/main/examples/svelte#sveltekit-setup)
- [Waku (with RSC)](https://github.com/rayrw/vite-plugin-svg-ts/blob/main/examples/waku/README.md#waku-setup)

## Roadmap / Todo

* Add support for more frameworks
* Allow customizing the output path for generated types
* Explore ways to optimize SVG files automatically
