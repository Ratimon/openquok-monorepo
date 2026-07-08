<script lang="ts">
	import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import type { SimpleLinkCardItem } from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import type {
		PublicListingsPreviewGridBlockVm,
		PublicListingsPreviewVm
	} from '$lib/listings/server/loadAgentListingsPreview.server';
	import type { PublicPlaybooksNavTab } from '$lib/config/constants/config';

	import { focusPublicPlaybooksNav } from '$lib/ui/nav-bars/focusPublicPlaybooksNav';

	import FeatureSimpleCard from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import { UnderlineToBackgroundText } from '$lib/ui/texts/index.js';

	type LandingHeroTheme = {
		subtitleClass?: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type PreviewBlockKind = 'playbooks' | 'building-blocks';

	type PreviewGridCell =
		| {
				id: string;
				index: number;
				kind: 'listing';
				item: FeatureSimpleCardItem;
		  }
		| {
				id: string;
				index: number;
				kind: 'link';
				item: FeatureSimpleCardItem & SimpleLinkCardItem;
				linkKind: 'skill-builder' | 'see-all';
		  };

	type Props = {
		heroTheme: LandingHeroTheme;
		block: PublicListingsPreviewGridBlockVm;
		blockKind: PreviewBlockKind;
		headingId: PublicListingsPreviewVm['headingId'];
		seeAllScrollsToNavbar?: boolean;
		highlightClass: string;
		highlightTargetColor: string;
	};

	let {
		heroTheme,
		block,
		blockKind,
		headingId,
		seeAllScrollsToNavbar = false,
		highlightClass,
		highlightTargetColor
	}: Props = $props();

	let cells = $derived(buildPreviewGridCells(block, blockKind));

	function seeAllNavTab(kind: PreviewBlockKind): PublicPlaybooksNavTab {
		return kind === 'playbooks' ? 'playbook' : 'building-blocks';
	}

	function onSeeAllActivate() {
		if (!seeAllScrollsToNavbar) return;
		focusPublicPlaybooksNav(seeAllNavTab(blockKind));
	}

	function buildPreviewGridCells(
		blockVm: PublicListingsPreviewGridBlockVm,
		kind: PreviewBlockKind
	): PreviewGridCell[] {
		const listingCells: PreviewGridCell[] = blockVm.items.map((item, index) => ({
			id: item.id,
			kind: 'listing',
			item,
			index
		}));

		const linkCells: PreviewGridCell[] = [];

		if (kind === 'playbooks' && blockVm.skillBuilder) {
			linkCells.push({
				id: blockVm.skillBuilder.id,
				kind: 'link',
				item: blockVm.skillBuilder,
				index: listingCells.length + linkCells.length,
				linkKind: 'skill-builder'
			});
		}

		linkCells.push({
			id: blockVm.seeAll.id,
			kind: 'link',
			item: blockVm.seeAll,
			index: listingCells.length + linkCells.length,
			linkKind: 'see-all'
		});

		return [...listingCells, ...linkCells];
	}
</script>

<div class="space-y-6">
	<h3 class="mx-auto max-w-7xl text-lg font-bold tracking-tight sm:text-xl">
		<UnderlineToBackgroundText class={highlightClass} targetTextColor={highlightTargetColor}>
			{block.gridLabel}
		</UnderlineToBackgroundText>
	</h3>

	<SimpleCardGrid
		{heroTheme}
		headingId={`${headingId}-${blockKind}`}
		title=""
		items={cells}
		getItemKey={(cell) => cell.id}
		sectionClass="py-0"
	>
		{#snippet card(cell, context)}
			{#if cell.kind === 'link'}
				<FeatureSimpleCard
					item={cell.item}
					href={cell.linkKind === 'see-all' && seeAllScrollsToNavbar ? undefined : cell.item.href}
					onActivate={cell.linkKind === 'see-all' && seeAllScrollsToNavbar ? onSeeAllActivate : undefined}
					backgroundVariant="striped"
					stripedDirection={cell.linkKind === 'skill-builder' ? 'left' : 'right'}
					stripedTone={blockKind === 'building-blocks' ? 'amber' : 'emerald'}
				/>
			{:else}
				<FeatureSimpleCard item={cell.item} backgroundVariant="hexagon" pattern={context.pattern} />
			{/if}
		{/snippet}
	</SimpleCardGrid>
</div>
