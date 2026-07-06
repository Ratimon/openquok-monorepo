<script lang="ts">
	import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import type { PublicListingsPreviewVm } from '$lib/listings/utils/loadAgentListingsPreview.server';

	import FeatureSimpleCard from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import FeaturesSectionHeader from '$lib/ui/templates/feature-grid/FeaturesSectionHeader.svelte';
	import { UnderlineToBackgroundText } from '$lib/ui/text/index.js';

	type LandingHeroTheme = {
		subtitleClass?: string;
		titleHighlightPillClass: string;
		parseLandingHeroTitlePartSegments: (text: string) => { text: string; highlight: boolean }[];
	};

	type PreviewGridBlock = PublicListingsPreviewVm['playbooksBlock'];

	type Props = {
		heroTheme: LandingHeroTheme;
		previewVm: PublicListingsPreviewVm;
		sectionClass?: string;
	};

	let { heroTheme, previewVm, sectionClass = 'py-16 sm:py-20' }: Props = $props();

	const CARD_PATTERNS: number[][][] = [
		[
			[7, 1],
			[8, 3],
			[9, 5]
		],
		[
			[6, 2],
			[8, 4],
			[10, 1]
		],
		[
			[7, 4],
			[9, 2],
			[11, 5]
		],
		[
			[8, 1],
			[10, 3],
			[12, 2]
		],
		[
			[6, 5],
			[9, 1],
			[11, 4]
		],
		[
			[7, 2],
			[8, 5],
			[10, 3]
		]
	];

	function patternForIndex(index: number): number[][] {
		return CARD_PATTERNS[index % CARD_PATTERNS.length];
	}

	function gridCells(block: PreviewGridBlock): Array<
		| { kind: 'listing'; item: FeatureSimpleCardItem; index: number }
		| { kind: 'see-all'; item: FeatureSimpleCardItem & { href: string }; index: number }
	> {
		const listingCells = block.items.map((item, index) => ({
			kind: 'listing' as const,
			item,
			index
		}));
		return [
			...listingCells,
			{
				kind: 'see-all' as const,
				item: block.seeAll,
				index: listingCells.length
			}
		];
	}
</script>

{#snippet previewGrid(block: PreviewGridBlock)}
	<div
		class="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
		aria-label={block.gridLabel}
	>
		{#each gridCells(block) as cell (cell.item.id)}
			{#if cell.kind === 'see-all'}
				<FeatureSimpleCard item={cell.item} href={cell.item.href} pattern={patternForIndex(cell.index)} />
			{:else}
				<FeatureSimpleCard item={cell.item} pattern={patternForIndex(cell.index)} />
			{/if}
		{/each}
	</div>
{/snippet}

<section
	class="relative isolate overflow-hidden bg-base-100 {sectionClass}"
	aria-labelledby={previewVm.headingId}
>
	<div class="container mx-auto px-4">
		<FeaturesSectionHeader
			{heroTheme}
			headingId={previewVm.headingId}
			title={previewVm.title}
			description={previewVm.description}
			subtitle={previewVm.subtitle}
		/>

		<div class="mt-12 space-y-12 sm:mt-14 sm:space-y-14">
			<div class="space-y-6">
				<h3 class="mx-auto max-w-7xl text-lg font-bold tracking-tight sm:text-xl">
					<UnderlineToBackgroundText class="text-emerald-300" targetTextColor="#ecfdf5">
						{previewVm.playbooksBlock.gridLabel}
					</UnderlineToBackgroundText>
				</h3>
				{@render previewGrid(previewVm.playbooksBlock)}
			</div>

			<div class="space-y-6">
				<h3 class="mx-auto max-w-7xl text-lg font-bold tracking-tight sm:text-xl">
					<UnderlineToBackgroundText class="text-amber-200" targetTextColor="#fffbeb">
						{previewVm.buildingBlocksBlock.gridLabel}
					</UnderlineToBackgroundText>
				</h3>
				{@render previewGrid(previewVm.buildingBlocksBlock)}
			</div>
		</div>
	</div>
</section>
