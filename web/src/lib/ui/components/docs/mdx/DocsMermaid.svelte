<script lang="ts">
	import type { Component } from 'svelte';
	import type { MermaidConfig } from '@friendofsvelte/mermaid';

	import { browser } from '$app/environment';

	type Props = {
		string: string;
		class?: string;
	};

	type MermaidProps = {
		string: string;
		config?: MermaidConfig;
		class?: string;
	};

	let { string: diagram, class: className = '' }: Props = $props();

	/** DaisyUI themes: `forest` is dark; `light` is light. */
	let colorScheme = $state<'light' | 'dark'>('dark');
	let MermaidComp = $state<Component<MermaidProps> | null>(null);

	$effect(() => {
		if (!browser) return;
		const root = document.documentElement;
		const sync = () => {
			const dataTheme = root.getAttribute('data-theme') ?? 'forest';
			colorScheme = dataTheme === 'light' ? 'light' : 'dark';
		};
		sync();
		const mo = new MutationObserver(sync);
		mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		return () => mo.disconnect();
	});

	$effect(() => {
		if (!browser) return;
		let cancelled = false;
		void import('@friendofsvelte/mermaid').then((mod) => {
			if (!cancelled) MermaidComp = mod.Mermaid;
		});
		return () => {
			cancelled = true;
		};
	});

	let config = $derived<MermaidConfig>({
		theme: colorScheme === 'light' ? 'default' : 'dark',
		sequence: { useMaxWidth: true }
	});
</script>

<div class="not-prose my-6 overflow-x-auto {className}">
	{#if MermaidComp}
		{#key colorScheme}
			<MermaidComp string={diagram} {config} />
		{/key}
	{:else}
		<div
			class="bg-base-200/40 text-base-content/50 min-h-24 animate-pulse rounded-md px-3 py-6 text-sm"
			aria-hidden="true"
		>
			Loading diagram…
		</div>
	{/if}
</div>
