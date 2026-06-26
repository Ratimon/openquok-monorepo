<script lang="ts">
	import type { MermaidConfig } from '@friendofsvelte/mermaid';

	import { browser } from '$app/environment';
	import { Mermaid } from '@friendofsvelte/mermaid';

	type Props = {
		string: string;
		class?: string;
	};

	let { string: diagram, class: className = '' }: Props = $props();

	/** DaisyUI themes: `forest` is dark; `light` is light. */
	let colorScheme = $state<'light' | 'dark'>('dark');

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

	let config = $derived<MermaidConfig>({
		theme: colorScheme === 'light' ? 'default' : 'dark',
		sequence: { useMaxWidth: true }
	});
</script>

<div class="not-prose my-6 overflow-x-auto {className}">
	{#key colorScheme}
		<Mermaid string={diagram} {config} />
	{/key}
</div>
