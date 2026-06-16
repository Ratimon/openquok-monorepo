<script lang="ts">
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { copyToClipboard } from '$lib/utils/clipboard';

	type Props = {
		code: string;
		ariaLabel?: string;
		class?: string;
	};

	let {
		code,
		ariaLabel = 'Copy command to clipboard',
		class: className = ''
	}: Props = $props();

	let copied = $state(false);

	const trimmedCode = $derived(code.trim());

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
		'group/code relative flex items-center gap-2 rounded-lg border border-base-content/10 bg-base-200/80 px-3 py-2.5 shadow-sm',
		className
	)}
>
	<code class="text-base-content/90 min-w-0 flex-1 break-all font-mono text-[13px] leading-snug">
		{trimmedCode}
	</code>
	<button
		type="button"
		class="border-base-300 bg-base-100/80 text-base-content/70 hover:text-base-content shrink-0 rounded-md border px-2 py-1 text-xs transition-colors"
		aria-label={ariaLabel}
		onclick={handleCopy}
	>
		<span class="inline-flex items-center gap-1">
			<AbstractIcon name={icons.Copy.name} class="size-3.5" width="14" height="14" />
			{copied ? 'Copied!' : 'Copy'}
		</span>
	</button>
</div>
