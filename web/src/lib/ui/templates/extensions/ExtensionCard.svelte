<script lang="ts">
	import type { ExtensionCardViewModel } from '$lib/listings/index';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { url } from '$lib/utils/path';

	import * as Collapsible from '$lib/ui/collapsible/index.js';
	import { cn } from '$lib/ui/helpers/common';

	import ExtensionCardExpanded from '$lib/ui/templates/extensions/ExtensionCardExpanded.svelte';

	type Props = {
		extension: ExtensionCardViewModel;
		expanded: boolean;
		onToggle?: (id: string) => void;
		class?: string;
	};

	let { extension, expanded = false, onToggle, class: className = '' }: Props = $props();

	const detailHref = $derived(url(`/${getRootPathPublicExtension(extension.slug)}`));

	const typeLabel = $derived.by(() => {
		if (extension.isOfficial) return 'Official';
		switch (extension.extensionType) {
			case 'skills':
				return 'Skills';
			case 'mcp':
				return 'MCP';
			case 'both':
				return 'Skills + MCP';
			default:
				return 'Extension';
		}
	});
</script>

<Collapsible.Root
	open={expanded}
	onOpenChange={(open) => {
		if (open !== expanded) onToggle?.(extension.id);
	}}
	class={cn('rounded-2xl border border-base-content/10 bg-base-100/80', className)}
>
	<Collapsible.Trigger
		class="flex w-full items-start gap-4 p-4 text-left transition hover:bg-base-200/40"
	>
		{#if extension.logoImageUrl}
			<img
				src={extension.logoImageUrl}
				alt=""
				width="48"
				height="48"
				class="size-12 shrink-0 rounded-xl border border-base-content/10 object-cover"
				loading="lazy"
			/>
		{:else}
			<div
				class="grid size-12 shrink-0 place-items-center rounded-xl border border-base-content/10 bg-base-200 text-sm font-bold"
				aria-hidden="true"
			>
				{extension.title.slice(0, 1).toUpperCase()}
			</div>
		{/if}

		<div class="min-w-0 flex-1 space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-base font-semibold text-base-content">{extension.title}</h3>
				<span class="badge badge-outline badge-sm">{typeLabel}</span>
			</div>
			{#if extension.excerpt || extension.description}
				<p class="line-clamp-2 text-sm text-base-content/70">
					{extension.excerpt ?? extension.description}
				</p>
			{/if}
			<div class="flex flex-wrap gap-3 text-xs text-base-content/60">
				{#if extension.category}
					<span>{extension.category.name}</span>
				{/if}
				<span>{extension.likes} likes</span>
				<span>{extension.views} views</span>
			</div>
		</div>
	</Collapsible.Trigger>

	<Collapsible.Content class="border-t border-base-content/10 px-4 pb-4">
		<ExtensionCardExpanded extension={extension} detailHref={detailHref} />
	</Collapsible.Content>
</Collapsible.Root>
