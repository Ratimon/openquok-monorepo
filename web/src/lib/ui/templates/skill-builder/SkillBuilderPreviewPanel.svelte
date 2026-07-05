<script lang="ts">
	import { downloadMarkdownFile } from '$lib/skill-builder/utils/downloadMarkdown';

	import Button from '$lib/ui/buttons/Button.svelte';

	type CartaMarkdownPreviewComponent = typeof import('$lib/ui/templates/skill-builder/CartaMarkdownPreview.svelte').default;

	let cartaPreviewPromise: Promise<{ default: CartaMarkdownPreviewComponent }> | null = null;

	function loadCartaPreview() {
		cartaPreviewPromise ??= import('$lib/ui/templates/skill-builder/CartaMarkdownPreview.svelte');
		return cartaPreviewPromise;
	}

	let CartaMarkdownPreview = $state<CartaMarkdownPreviewComponent | null>(null);

	$effect(() => {
		let cancelled = false;
		void loadCartaPreview().then((mod) => {
			if (!cancelled) CartaMarkdownPreview = mod.default;
		});
		return () => {
			cancelled = true;
		};
	});

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
		saveAsStackLabel = 'Save as playbook'
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
		{#if CartaMarkdownPreview}
			<CartaMarkdownPreview bind:markdown {onMarkdownEdit} class="h-full max-h-[min(70vh,720px)]" />
		{:else}
			<p class="text-base-content/60 px-1 py-10 text-sm">Loading editor…</p>
		{/if}
	</div>
</div>
