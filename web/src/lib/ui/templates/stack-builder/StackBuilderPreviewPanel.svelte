<script lang="ts">
	import { downloadMarkdownFile } from '$lib/stack-builder/utils/downloadMarkdown';

	import Button from '$lib/ui/buttons/Button.svelte';
	import CartaMarkdownPreview from '$lib/ui/templates/stack-builder/CartaMarkdownPreview.svelte';

	type Props = {
		markdown?: string;
		downloadFilename?: string;
	};

	let { markdown = $bindable(''), downloadFilename = 'agent-stack.md' }: Props = $props();

	function handleDownload() {
		downloadMarkdownFile(markdown, downloadFilename);
	}
</script>

<div class="flex h-full min-h-0 flex-col">
	<header class="flex flex-wrap items-center justify-between gap-2 border-b border-base-content/10 px-4 py-3">
		<div>
			<h2 class="text-sm font-semibold text-base-content">Export</h2>
			<p class="mt-1 text-xs text-base-content/60">
				Edit markdown with Write / Preview tabs. Updates when the workflow changes.
			</p>
		</div>
		<Button variant="primary" size="sm" onclick={handleDownload}>Download</Button>
	</header>

	<div class="min-h-0 flex-1 overflow-hidden p-3">
		<CartaMarkdownPreview bind:markdown class="h-full max-h-[min(70vh,720px)]" />
	</div>
</div>
