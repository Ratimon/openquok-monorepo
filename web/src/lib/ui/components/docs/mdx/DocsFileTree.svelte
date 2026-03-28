<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children
	}: {
		children: Snippet;
	} = $props();
</script>

<div class="not-prose border-base-300 bg-base-200/40 my-6 rounded-lg border p-4 font-mono text-sm">
	<div class="file-tree">
		{@render children()}
	</div>
</div>

<style>
	:global(.file-tree ul) {
		list-style: none;
		padding-left: 1.25rem;
		margin: 0;
	}
	:global(.file-tree > ul) {
		padding-left: 0;
	}
	:global(.file-tree li) {
		position: relative;
		padding: 1px 0;
	}
	:global(.file-tree li::before) {
		content: '';
		position: absolute;
		left: -1rem;
		top: 0;
		bottom: 0;
		width: 1px;
		background: color-mix(in oklab, var(--color-base-content) 15%, transparent);
	}
	:global(.file-tree li::after) {
		content: '';
		position: absolute;
		left: -1rem;
		top: 0.75rem;
		width: 0.75rem;
		height: 1px;
		background: color-mix(in oklab, var(--color-base-content) 15%, transparent);
	}
	:global(.file-tree > ul > li::before),
	:global(.file-tree > ul > li::after) {
		display: none;
	}
</style>
