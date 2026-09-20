<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PrimaryThemedCodePreview from '$lib/ui/templates/api-marketing/PrimaryThemedCodePreview.svelte';

	const PUBLIC_API_JSON_PAYLOAD_BLOCK_CLASS =
		'overflow-hidden rounded-xl border border-primary/25 bg-base-100 shadow-sm ring-1 ring-primary/10';

	const PUBLIC_API_JSON_PAYLOAD_BLOCK_HEADER_CLASS =
		'flex items-center justify-between gap-2 border-b border-primary/20 bg-primary/8 px-3 py-2';

	const PUBLIC_API_JSON_PAYLOAD_BLOCK_LABEL_CLASS =
		'font-mono text-xs font-semibold tracking-wide text-primary uppercase';

	const PUBLIC_API_JSON_PAYLOAD_BLOCK_BODY_CLASS = 'overflow-x-auto p-4 text-xs leading-relaxed';

	const PUBLIC_API_JSON_PAYLOAD_EMBEDDED_CLASS =
		'min-h-0 flex-1 overflow-auto rounded-md border border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed';

	type Props = {
		json?: string;
		shell?: string;
		label?: string;
		/** Full card with header + copy, or inline panel for nested layouts. */
		variant?: 'standalone' | 'embedded';
		showCopy?: boolean;
		class?: string;
	};

	let {
		json,
		shell,
		label = 'JSON payload',
		variant = 'standalone',
		showCopy = true,
		class: className = ''
	}: Props = $props();

	let copied = $state(false);

	const code = $derived((shell ?? json ?? '').trim());
	const kind = $derived(shell ? ('shell' as const) : ('json' as const));

	async function handleCopy() {
		if (!code) return;
		const ok = await copyToClipboard(code);
		if (!ok) return;
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

{#if variant === 'embedded'}
	<div class={cn(PUBLIC_API_JSON_PAYLOAD_EMBEDDED_CLASS, className)}>
		{#if showCopy}
			<div class="mb-2 flex justify-end">
				<button
					type="button"
					class="border-primary/25 bg-base-100/90 text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors"
					aria-label="Copy JSON payload"
					onclick={() => void handleCopy()}
				>
					<AbstractIcon name={icons.Copy.name} class="size-3.5" width="14" height="14" />
					{copied ? 'Copied' : 'Copy'}
				</button>
			</div>
		{/if}
		<PrimaryThemedCodePreview {code} {kind} />
	</div>
{:else}
	<div class={cn(PUBLIC_API_JSON_PAYLOAD_BLOCK_CLASS, className)}>
		<div class={PUBLIC_API_JSON_PAYLOAD_BLOCK_HEADER_CLASS}>
			<span class={PUBLIC_API_JSON_PAYLOAD_BLOCK_LABEL_CLASS}>{label}</span>
			{#if showCopy}
				<button
					type="button"
					class="border-primary/25 bg-base-100/90 text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors"
					aria-label="Copy JSON payload"
					onclick={() => void handleCopy()}
				>
					<AbstractIcon name={icons.Copy.name} class="size-3.5" width="14" height="14" />
					{copied ? 'Copied' : 'Copy'}
				</button>
			{/if}
		</div>
		<div class={PUBLIC_API_JSON_PAYLOAD_BLOCK_BODY_CLASS}>
			<PrimaryThemedCodePreview {code} {kind} />
		</div>
	</div>
{/if}
