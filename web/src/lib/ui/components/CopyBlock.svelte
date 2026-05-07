<script lang="ts">
	// based on https://github.com/skeletonlabs/skeleton/blob/58d9780dafd4a7ca04b1086a30aac8c0dc3ce416/src/lib/utilities/CodeBlock/CodeBlock.svelte
	import {clipboard, copyToClipboard} from '$lib/utils/clipboard';

	type Props = {
		text: string;
		background: string;
		copiedBackground: string;
		boxClass: string;
		class?: string;
		copiedColor: string;
	};

	let {
		text = '',
		background = '',
		copiedBackground = '',
		boxClass = '',
		class: className = '',
		copiedColor = ''
	}: Props = $props();

	let copyState = $state(false);
	let buttonLabel = $state('Copy');

	function onCopyClick() {
		copyState = true;
		setTimeout(() => {
			copyState = false;
		}, 1000);
	}

	async function handleToolbarCopy(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		const ok = await copyToClipboard(text);
		if (!ok) return;
		onCopyClick();
		buttonLabel = 'Copied!';
		setTimeout(() => {
			buttonLabel = 'Copy';
		}, 2000);
	}
</script>

<div class="group/code relative w-full">
	<button
		type="button"
		class="border-base-300 bg-base-100/80 text-base-content/70 hover:text-base-content pointer-events-none absolute top-2 right-2 z-10 rounded-md border px-2 py-1 text-xs opacity-0 transition-opacity group-hover/code:pointer-events-auto group-hover/code:opacity-100 group-focus-within/code:pointer-events-auto group-focus-within/code:opacity-100"
		aria-label="Copy to clipboard"
		onclick={handleToolbarCopy}
	>
		{buttonLabel}
	</button>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		role="button"
		tabindex="0"
		class={`${boxClass} ${copyState ? copiedBackground : background}`}
		oncopied={onCopyClick}
		use:clipboard={text}
	>
		{#if copyState}
			<code class={`${className} ${copiedColor}`}>Copied ✓</code>
		{:else}
			<code class={className}>{text}</code>
		{/if}
	</div>
</div>
