<script lang="ts">
	import { browser } from '$app/environment';

	import { cn } from '$lib/ui/helpers/common';
	import { copyToClipboard } from '$lib/utils/clipboard';

	type Props = {
		code: string;
		language?: 'bash' | 'shell';
		ariaLabel?: string;
		class?: string;
	};

	let {
		code,
		language = 'bash',
		ariaLabel = 'Terminal command example',
		class: className = ''
	}: Props = $props();

	let html = $state('');
	let copied = $state(false);

	const trimmedCode = $derived(code.trim());

	$effect(() => {
		if (!browser || !trimmedCode) {
			html = '';
			return;
		}
		let cancelled = false;
		void import('$lib/docs/utils/shiki-highlight')
			.then(({ highlightCode }) => highlightCode(trimmedCode, language))
			.then((h) => {
				if (!cancelled) html = h;
			});
		return () => {
			cancelled = true;
		};
	});

	async function handleCopy() {
		const ok = await copyToClipboard(trimmedCode);
		if (!ok) return;
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div
	class={cn(
		'group/code relative rounded-xl border border-base-content/10 bg-base-200/80 shadow-lg',
		className
	)}
	role="img"
	aria-label={ariaLabel}
>
	<button
		type="button"
		class="border-base-300 bg-base-100/80 text-base-content/70 hover:text-base-content absolute top-2 right-2 z-10 rounded-md border px-2 py-1 text-xs transition-colors"
		aria-label="Copy commands to clipboard"
		onclick={handleCopy}
	>
		{copied ? 'Copied!' : 'Copy'}
	</button>

	<div
		class="[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:break-all [&_pre]:whitespace-pre-wrap [&_.shiki]:bg-transparent p-4 pt-10 text-[13px] leading-relaxed"
	>
		{#if html}
			<!-- eslint-disable svelte/no-at-html-tags -->
			{@html html}
		{:else}
			<pre class="text-base-content/90 m-0 bg-transparent font-mono break-all whitespace-pre-wrap"><code
					>{trimmedCode}</code
				></pre>
		{/if}
	</div>
</div>
