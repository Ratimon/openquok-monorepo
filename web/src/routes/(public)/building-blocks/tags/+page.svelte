<script lang="ts">
	import type { PageData } from './$types';

	import {
		getRootPathPublicBuildingBlocks,
		getRootPathPublicBuildingBlocksTag
	} from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { route, url } from '$lib/utils/path';
	import { stringToSlug } from '$lib/ui/helpers/common';

	import { Card, CardHeader } from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import ListingsPublicHubNav from '$lib/ui/templates/listings/ListingsPublicHubNav.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let tagFilterVm = $derived(data.tagFilterVm);
	let schemaData = $derived(data.schemaData);

	// /building-blocks
	const buildingBlocksHubHref = url(route(getRootPathPublicBuildingBlocks()));

	function tagHref(slug: string): string {
		return url(route(getRootPathPublicBuildingBlocksTag(slug)));
	}

	function listingCountLabel(count: number): string {
		return count === 1 ? '1 building block' : `${count} building blocks`;
	}

	const groupedTags = $derived.by(() => {
		const groups: Record<string, typeof tagFilterVm.tags> = {};
		for (const tag of tagFilterVm.tags) {
			const groupName = tag.groupSlugs[0] ?? 'Other';
			const label =
				tagFilterVm.groups.find((group) => group.slug === groupName)?.label ?? 'Other';
			(groups[label] ??= []).push(tag);
		}
		return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
	});
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="space-y-2">
						<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">
							Building Blocks
						</p>
						<h1 class="text-3xl font-bold">All Tags</h1>
					</div>
					<Button variant="outline" href={buildingBlocksHubHref}>View all building blocks</Button>
				</div>

				<ListingsPublicHubNav active="building-blocks" class="mb-6" />

				{#if tagFilterVm.groups.length > 0}
					<div class="mb-10">
						<h2 class="mb-4 text-lg font-semibold">Tag groups</h2>
						<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{#each tagFilterVm.groups as group (group.slug)}
								<a href={tagHref(group.slug)} class="block">
									<Card class="h-full transition-all hover:shadow-md">
										<CardHeader>
											<h3 class="text-xl font-semibold">{group.label}</h3>
											<p class="text-sm text-base-content/70">
												{listingCountLabel(group.count)}
											</p>
										</CardHeader>
									</Card>
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if !tagFilterVm.tags.length}
					<p class="text-base-content/70">No building block tags available yet.</p>
				{:else}
					<p class="mb-8 text-base-content/70">
						Browse building blocks by tag — platforms, use cases, and catalog labels.
					</p>
					<div class="space-y-8">
						{#each groupedTags as [groupName, tags] (groupName)}
							<div id={stringToSlug(groupName)}>
								<h2 class="mb-4 text-lg font-semibold">{groupName}</h2>
								<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{#each tags as tag (tag.slug)}
										<a href={tagHref(tag.slug)} class="block">
											<Card class="h-full transition-all hover:shadow-md">
												<CardHeader>
													<h3 class="text-xl font-semibold">{tag.label}</h3>
													<p class="text-sm text-base-content/70">
														{listingCountLabel(tag.count)}
													</p>
												</CardHeader>
											</Card>
										</a>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</SubSectionInnerContainer>
	</SubSectionOuterContainer>
</SectionOuterContainer>
