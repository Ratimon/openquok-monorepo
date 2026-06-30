<script lang="ts">
	import { parseListingMarkdown } from '$lib/listings/utils/parseListingMarkdown';
	import { cn } from '$lib/ui/helpers/common';

	import {
		extensionCatalogTableClass,
		extensionCatalogTableHeadCellClass,
		extensionCatalogTableRowClass,
		extensionCatalogTableShellClass
	} from '$lib/ui/components/extensions/extensionCatalogTableClasses';
	import TerminalCommandMock from '$lib/ui/templates/device-mocks/terminal/TerminalCommandMock.svelte';

	import ListingInlineMarkdown from '$lib/ui/templates/extensions/ListingInlineMarkdown.svelte';

	type Props = {
		markdown: string | null | undefined;
		class?: string;
		emptyMessage?: string;
	};

	let { markdown, class: className = '', emptyMessage = 'No documentation yet.' }: Props = $props();

	const blocks = $derived(parseListingMarkdown(markdown ?? ''));

	const headingClass: Record<number, string> = {
		1: 'text-3xl font-black tracking-tight',
		2: 'text-2xl font-bold',
		3: 'text-xl font-semibold',
		4: 'text-lg font-semibold',
		5: 'text-base font-semibold',
		6: 'text-sm font-semibold uppercase tracking-wide'
	};

	function codeLanguage(language: string): 'bash' | 'shell' {
		const normalized = language.trim().toLowerCase();
		if (normalized === 'shell' || normalized === 'sh') return 'shell';
		return 'bash';
	}

	function shouldUseTerminalMock(language: string): boolean {
		const normalized = language.trim().toLowerCase();
		return !normalized || ['bash', 'shell', 'sh', 'text', 'zsh'].includes(normalized);
	}
</script>

{#if blocks.length > 0}
	<div class={cn('space-y-4', className)}>
		{#each blocks as block, index (index)}
			{#if block.type === 'heading'}
				<svelte:element this={`h${block.level}`} class={headingClass[block.level] ?? headingClass[3]}>
					<ListingInlineMarkdown text={block.text} />
				</svelte:element>
			{:else if block.type === 'paragraph'}
				<p class="text-base-content/80">
					<ListingInlineMarkdown text={block.text} />
				</p>
			{:else if block.type === 'ul'}
				<ul class="list-disc space-y-1 pl-5 text-base-content/80">
					{#each block.items as item, itemIndex (itemIndex)}
						<li><ListingInlineMarkdown text={item} /></li>
					{/each}
				</ul>
			{:else if block.type === 'ol'}
				<ol class="list-decimal space-y-1 pl-5 text-base-content/80">
					{#each block.items as item, itemIndex (itemIndex)}
						<li><ListingInlineMarkdown text={item} /></li>
					{/each}
				</ol>
			{:else if block.type === 'table'}
				<div class={extensionCatalogTableShellClass}>
					<table class={extensionCatalogTableClass}>
						<thead>
							<tr>
								{#each block.headers as header, headerIndex (headerIndex)}
									<th class={extensionCatalogTableHeadCellClass}>
										<ListingInlineMarkdown text={header} />
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each block.rows as row, rowIndex (rowIndex)}
								<tr class={extensionCatalogTableRowClass}>
									{#each row as cell, cellIndex (cellIndex)}
										<td class="px-3 py-2 align-top text-sm text-base-content/85">
											<ListingInlineMarkdown text={cell} />
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else if block.type === 'code'}
				{#if shouldUseTerminalMock(block.language)}
					<TerminalCommandMock code={block.content} language={codeLanguage(block.language)} />
				{:else}
					<pre class="overflow-x-auto rounded-lg border border-base-content/20 bg-base-content/10 p-4 font-mono text-sm"><code>{block.content}</code></pre>
				{/if}
			{:else if block.type === 'blockquote'}
				<blockquote class="border-l-4 border-primary/40 pl-4 text-base-content/75 italic">
					<ListingInlineMarkdown text={block.text} />
				</blockquote>
			{:else if block.type === 'hr'}
				<hr class="border-base-content/15" />
			{/if}
		{/each}
	</div>
{:else}
	<p class="text-base-content/70">{emptyMessage}</p>
{/if}
