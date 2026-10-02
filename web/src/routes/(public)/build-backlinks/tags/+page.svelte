<script lang="ts">
	import type { PageData } from './$types';

	import {
		getRootPathPublicBuildBacklinks,
		getRootPathPublicBuildBacklinksTag
	} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { route, url } from '$lib/utils/path';
	import { stringToSlug } from '$lib/ui/helpers/common';

	import { Card, CardHeader } from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let tags = $derived(data.tags);
	let schemaData = $derived(data.schemaData);

	const hubHref = url(route(getRootPathPublicBuildBacklinks()));

	function tagHref(slug: string): string {
		return url(route(getRootPathPublicBuildBacklinksTag(slug)));
	}

	function siteCountLabel(count: number): string {
		return count === 1 ? '1 site' : `${count} sites`;
	}

	const groupedTags = $derived.by(() => {
		const groups: Record<string, typeof tags> = {};
		for (const tag of tags) {
			const groupName = tag.groupName;
			(groups[groupName] ??= []).push(tag);
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
						<p class="text-xs font-semibold uppercase tracking-wide text-primary">Build backlinks</p>
						<h1 class="text-3xl font-bold">All tags</h1>
					</div>
					<Button variant="outline" href={hubHref}>View all opportunities</Button>
				</div>

				{#if !tags.length}
					<p class="text-base-content/70">No backlink tags available yet.</p>
				{:else}
					<p class="mb-8 text-base-content/70">
						Editorial tags are applied by hand on each site. Opportunity filters group sites when any
						published path matches — the same rules as the hub sidebar.
					</p>
					<div class="space-y-8">
						{#each groupedTags as [groupName, groupTags] (groupName)}
							<div id={stringToSlug(groupName)}>
								<h2 class="mb-4 text-lg font-semibold">{groupName}</h2>
								<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
									{#each groupTags as tag (tag.slug)}
										<a href={tagHref(tag.slug)} class="block">
											<Card class="h-full transition-all hover:shadow-md">
												<CardHeader>
													<h3 class="text-xl font-semibold">{tag.label}</h3>
													<p class="text-sm text-base-content/70">
														{siteCountLabel(tag.count)}
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
