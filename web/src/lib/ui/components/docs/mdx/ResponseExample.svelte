<script lang="ts">
	import { browser } from '$app/environment';

	import { cn } from '$lib/ui/helpers/common';
	import { highlightCode } from '$lib/docs/utils/shiki-highlight';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';

	let {
		status = '200',
		code = '',
		class: className = ''
	}: {
		status?: string;
		code?: string;
		class?: string;
	} = $props();

	let html = $state('');
	let copied = $state(false);

	$effect(() => {
		if (!browser || !code.trim()) {
			html = '';
			return;
		}
		let cancelled = false;
		void highlightCode(code.trim(), 'json').then((h) => {
			if (!cancelled) html = h;
		});
		return () => {
			cancelled = true;
		};
	});

	async function copy() {
		await navigator.clipboard.writeText(code.trim());
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div
	class={cn(
		'border-primary/18 bg-base-100 overflow-hidden rounded-xl border shadow-md ring-1 ring-base-300/35',
		className
	)}
>
	<div
		class="border-base-300/70 bg-primary/8 flex items-center justify-between gap-3 border-b px-3 py-2.5"
	>
		<span
			class="border-primary/35 text-primary decoration-primary font-mono text-sm font-semibold tracking-wide underline decoration-2 underline-offset-[10px]"
			>{status}</span
		>
		<button
			type="button"
			class="border-base-300/70 bg-base-100 text-base-content/75 hover:bg-base-200/80 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors"
			onclick={copy}
		>
			<AbstractIcon name={icons.Copy.name} class="size-3.5" width="14" height="14" />
			{copied ? 'Copied' : 'Copy'}
		</button>
	</div>
	<div
		class="[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_.shiki]:bg-base-200/15 dark:[&_.shiki]:bg-base-950/40 overflow-x-auto text-[13px] leading-relaxed"
	>
		{#if html}
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html html}
		{:else}
			<pre class="text-base-content/90 m-0 bg-transparent p-4 font-mono whitespace-pre-wrap"><code>{code}</code></pre>
		{/if}
	</div>
</div>
