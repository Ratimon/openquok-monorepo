<script lang="ts">
	import type { ExtensionCategoryViewModel } from '$lib/listings/index';

	import {
		getRootPathPublicBuildingBlocks,
		getRootPathPublicBuildingBlocksCategories,
		getRootPathPublicBuildingBlocksCategory,
		getRootPathPublicBuildingBlocksCategoryTag,
		getRootPathPublicBuildingBlocksTag
	} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import {
		getRootPathPublicPlaybooks,
		getRootPathPublicPlaybooksCategories,
		getRootPathPublicPlaybooksCategory,
		getRootPathPublicPlaybooksCategoryTag,
		getRootPathPublicPlaybooksTag
	} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { route, url } from '$lib/utils/path';

	import { cn } from '$lib/ui/helpers/common';

	type HubKind = 'building-blocks' | 'playbooks';

	type Props = {
		categoriesVm: ExtensionCategoryViewModel[];
		activeCategorySlug: string | null;
		activeTagPathSlug?: string | null;
		onSelect?: (slug: string | null) => void;
		linkMode?: boolean;
		hubKind?: HubKind;
		class?: string;
	};

	let {
		categoriesVm,
		activeCategorySlug,
		activeTagPathSlug = null,
		onSelect,
		linkMode = false,
		hubKind = 'building-blocks',
		class: className = ''
	}: Props = $props();

	const hubHref = $derived(
		url(
			route(
				hubKind === 'playbooks'
					? getRootPathPublicPlaybooks()
					: getRootPathPublicBuildingBlocks()
			)
		)
	);

	const categoriesOverviewHref = $derived(
		url(
			route(
				hubKind === 'playbooks'
					? getRootPathPublicPlaybooksCategories()
					: getRootPathPublicBuildingBlocksCategories()
			)
		)
	);

	function categoryHref(slug: string): string {
		if (hubKind === 'playbooks') {
			if (activeTagPathSlug) {
				return url(route(getRootPathPublicPlaybooksCategoryTag(slug, activeTagPathSlug)));
			}
			return url(route(getRootPathPublicPlaybooksCategory(slug)));
		}
		if (activeTagPathSlug) {
			return url(route(getRootPathPublicBuildingBlocksCategoryTag(slug, activeTagPathSlug)));
		}
		return url(route(getRootPathPublicBuildingBlocksCategory(slug)));
	}

	const allCategoriesHref = $derived(
		activeTagPathSlug
			? url(
					route(
						hubKind === 'playbooks'
							? getRootPathPublicPlaybooksTag(activeTagPathSlug)
							: getRootPathPublicBuildingBlocksTag(activeTagPathSlug)
					)
				)
			: hubHref
	);

	const allCategoriesClass = $derived(
		cn('btn btn-sm w-full justify-start', !activeCategorySlug ? 'btn-primary' : 'btn-ghost')
	);

	const categoryButtonClass = (slug: string) =>
		cn(
			'btn btn-sm w-full justify-start text-left',
			activeCategorySlug === slug ? 'btn-primary' : 'btn-ghost'
		);
</script>

<nav class={cn('space-y-1', className)} aria-label="Extension categories">
	{#if linkMode}
		<a
			href={allCategoriesHref}
			class={allCategoriesClass}
			aria-current={!activeCategorySlug ? 'page' : undefined}
		>
			{activeTagPathSlug ? 'All categories for this tag' : 'All categories'}
		</a>
		<a href={categoriesOverviewHref} class="btn btn-ghost btn-sm w-full justify-start text-left">
			Browse all categories
		</a>
	{:else}
		<button
			type="button"
			class={allCategoriesClass}
			aria-current={!activeCategorySlug ? 'page' : undefined}
			onclick={() => onSelect?.(null)}
		>
			All categories
		</button>
	{/if}

	{#each categoriesVm as category (category.id)}
		{#if linkMode}
			<a
				href={categoryHref(category.slug)}
				class={categoryButtonClass(category.slug)}
				aria-current={activeCategorySlug === category.slug ? 'page' : undefined}
			>
				{category.name}
			</a>
		{:else}
			<button
				type="button"
				class={categoryButtonClass(category.slug)}
				aria-current={activeCategorySlug === category.slug ? 'page' : undefined}
				onclick={() => onSelect?.(category.slug)}
			>
				{category.name}
			</button>
		{/if}
	{/each}
</nav>
