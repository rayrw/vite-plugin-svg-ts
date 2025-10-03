<script lang="ts">
	import svg from 'virtual:svg-ts';
	import type { SvgName } from 'virtual:svg-ts';

	interface Props {
		name: SvgName;
	}

	let { name }: Props = $props();
</script>

<span>
	<!-- eslint-disable svelte/no-at-html-tags - we are rendering our svg files -->
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
