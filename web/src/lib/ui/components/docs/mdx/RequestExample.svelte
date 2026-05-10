<script lang="ts">
	import { browser } from '$app/environment';

	import { cn } from '$lib/ui/helpers/common';
	import { highlightCode } from '$lib/docs/utils/shiki-highlight';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icons';

	type Lang = 'bash' | 'json' | 'typescript' | 'javascript' | 'shell';

	let {
		title = 'Request',
		code = '',
		language = 'bash' satisfies Lang as Lang,
		/** Docs-site style: language dropdown instead of tabs (single sample for now). */
		dropdown = false,
		class: className = ''
	}: {
		title?: string;
		code?: string;
		language?: Lang;
		dropdown?: boolean;
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
		void highlightCode(code.trim(), language).then((h) => {
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
		'border-base-300/80 bg-base-100 overflow-hidden rounded-xl border shadow-sm ring-1 ring-base-300/30',
		className
	)}
>
	<div
		class="border-base-300/80 bg-base-200/35 flex items-center justify-between gap-3 border-b px-3 py-2"
	>
		<span class="text-base-content text-sm font-semibold tracking-tight">{title}</span>
		<div class="flex flex-wrap items-center justify-end gap-2">
			{#if dropdown}
				<span
					class="border-base-300/80 bg-base-100 text-base-content/75 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium"
				>
					<AbstractIcon name={icons.Terminal.name} class="size-3.5 opacity-70" width="14" height="14" />
					cURL
				</span>
			{/if}
			<button
				type="button"
				class="border-base-300/70 bg-base-100 text-base-content/75 hover:bg-base-200/80 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors"
				onclick={copy}
			>
				<AbstractIcon name={icons.Copy.name} class="size-3.5" width="14" height="14" />
				{copied ? 'Copied' : 'Copy'}
			</button>
		</div>
	</div>
	<div
		class="[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_.shiki]:bg-base-200/25 bg-base-100 overflow-x-auto text-[13px] leading-relaxed"
	>
		{#if html}
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html html}
		{:else}
			<pre class="text-base-content/90 m-0 bg-transparent p-4 font-mono whitespace-pre-wrap"><code>{code}</code></pre>
		{/if}
	</div>
</div>
