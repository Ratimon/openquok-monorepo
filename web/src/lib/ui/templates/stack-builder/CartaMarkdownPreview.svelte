<script lang="ts">
	import { MarkdownEditor } from 'carta-md';

	import { stackBuilderCarta } from '$lib/stack-builder/cartaInstance';

	import '@cartamd/plugin-emoji/default.css';
	import '@cartamd/plugin-slash/default.css';
	import 'carta-md/default.css';
	import '$lib/stack-builder/styles/carta-github.css';

	type Props = {
		markdown?: string;
		class?: string;
	};

	let { markdown = $bindable(''), class: className = '' }: Props = $props();
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
