<script lang="ts">
	import type { ExtensionCardViewModel } from '$lib/listings/index';

	import { icons } from '$data/icons';

	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { url } from '$lib/utils/path';

	import * as Collapsible from '$lib/ui/collapsible/index.js';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExtensionCardExpanded from '$lib/ui/templates/extensions/ExtensionCardExpanded.svelte';

	type Props = {
		extensionVm: ExtensionCardViewModel;
		expanded: boolean;
		onToggle?: (id: string) => void;
		class?: string;
	};

	let { extensionVm, expanded = false, onToggle, class: className = '' }: Props = $props();

	const detailHref = $derived(url(`/${getRootPathPublicExtension(extensionVm.slug)}`));

	const typeBadges = $derived.by((): string[] => {
		switch (extensionVm.extensionType) {
			case 'skills':
				return ['Skills'];
			case 'mcp':
				return ['MCP'];
			case 'both':
				return ['MCP', 'Skills'];
			default:
				return ['Extension'];
		}
	});
</script>

<Collapsible.Root
	open={expanded}
	onOpenChange={(open) => {
		if (open !== expanded) onToggle?.(extensionVm.id);
	}}
	class={cn('rounded-2xl border border-base-content/10 bg-base-100/80', className)}
>
	<Collapsible.Trigger
		class="flex w-full items-start gap-4 p-4 text-left transition hover:bg-base-200/40"
	>
		{#if extensionVm.logoImageUrl}
			<img
				src={extensionVm.logoImageUrl}
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
				{extensionVm.title.slice(0, 1).toUpperCase()}
			</div>
		{/if}

		<div class="min-w-0 flex-1 space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-base font-semibold text-base-content">{extensionVm.title}</h3>
				{#each typeBadges as badge (badge)}
					<span class="badge badge-outline badge-sm">{badge}</span>
				{/each}
				{#if extensionVm.isOfficial}
					<span class="badge badge-outline badge-sm">Official</span>
				{:else}
					<span class="badge badge-outline badge-sm">Community</span>
				{/if}
			</div>
			{#if extensionVm.excerpt || extensionVm.description}
				<p class="line-clamp-2 text-sm text-base-content/70">
					{extensionVm.excerpt ?? extensionVm.description}
				</p>
			{/if}
			<div class="flex flex-wrap gap-3 text-xs text-base-content/60">
				{#if extensionVm.category}
					<span>{extensionVm.category.name}</span>
				{/if}
				<span>{extensionVm.likes} likes</span>
				<span>{extensionVm.views} views</span>
			</div>
		</div>

		<AbstractIcon
			name={expanded ? icons.ChevronUp.name : icons.ChevronDown.name}
			class="size-4 shrink-0 self-center text-base-content/60"
			width="16"
			height="16"
			aria-hidden="true"
		/>
	</Collapsible.Trigger>

	<Collapsible.Content class="border-t border-base-content/10 px-4 pb-4">
		<ExtensionCardExpanded extensionVm={extensionVm} detailHref={detailHref} />
	</Collapsible.Content>
</Collapsible.Root>
