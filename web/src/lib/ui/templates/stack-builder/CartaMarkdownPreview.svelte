<script lang="ts">
	import { MarkdownEditor } from 'carta-md';
	import { onMount } from 'svelte';

	import { stackBuilderCarta } from '$lib/stack-builder/cartaInstance';

	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-slash/default.css';
	import 'carta-md/default.css';
	import 'github-markdown-css/github-markdown-dark.css';
	import '$lib/stack-builder/styles/carta-github.css';

	type Props = {
		markdown?: string;
		class?: string;
		onMarkdownEdit?: () => void;
	};

	let { markdown = $bindable(''), class: className = '', onMarkdownEdit }: Props = $props();

	onMount(() => {
		let detach: (() => void) | undefined;
		let attempts = 0;

		const attachInputListener = () => {
			const textarea = stackBuilderCarta.input?.textarea;
			if (!textarea) {
				if (attempts++ < 20) requestAnimationFrame(attachInputListener);
				return;
			}

			const handleInput = () => onMarkdownEdit?.();
			textarea.addEventListener('input', handleInput);
			detach = () => textarea.removeEventListener('input', handleInput);
		};

		attachInputListener();
		return () => detach?.();
	});
</script>

<div class="carta-stack-editor flex min-h-0 flex-col {className}">
	<MarkdownEditor
		bind:value={markdown}
		carta={stackBuilderCarta}
		mode="tabs"
		theme="github"
		scroll="async"
	/>
</div>

<style>
	.carta-stack-editor :global(.carta-editor) {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.carta-stack-editor :global(.carta-wrapper) {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
	}

	.carta-stack-editor :global(.carta-container) {
		flex: 1;
		min-height: 0;
	}

	.carta-stack-editor :global(.carta-container.mode-tabs > *) {
		height: 100%;
	}
</style>
