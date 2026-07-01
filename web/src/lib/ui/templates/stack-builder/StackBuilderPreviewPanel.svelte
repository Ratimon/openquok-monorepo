<script lang="ts">
	import { downloadMarkdownFile } from '$lib/stack-builder/utils/downloadMarkdown';

	import Button from '$lib/ui/buttons/Button.svelte';
	import CartaMarkdownPreview from '$lib/ui/templates/stack-builder/CartaMarkdownPreview.svelte';

	type Props = {
		markdown?: string;
		downloadFilename?: string;
		onMarkdownEdit?: () => void;
		onSaveAsStack?: () => void;
		saveAsStackLabel?: string;
	};

	let {
		markdown = $bindable(''),
		downloadFilename = 'SKILL.md',
		onMarkdownEdit,
		onSaveAsStack,
		saveAsStackLabel = 'Publish as stack'
	}: Props = $props();

	function handleDownload() {
		downloadMarkdownFile(markdown, downloadFilename);
	}
</script>

<div class="flex h-full min-h-0 flex-col">
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-base-content/10 px-4 py-3">
		<div>
			<h2 class="text-sm font-semibold text-base-content">
				Editor
			</h2>
			<p class="mt-1 text-xs text-base-content/60">
				Edit SKILL.md with Write / Preview tabs. Stays in sync with workflow until you edit here.
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			{#if onSaveAsStack}
				<Button variant="outline" size="sm" onclick={onSaveAsStack}>{saveAsStackLabel}</Button>
			{/if}
			<Button variant="primary" size="sm" onclick={handleDownload}>Download</Button>
		</div>
	</header>

	<div class="min-h-0 flex-1 overflow-hidden p-3">
		<CartaMarkdownPreview bind:markdown {onMarkdownEdit} class="h-full max-h-[min(70vh,720px)]" />
	</div>
</div>
