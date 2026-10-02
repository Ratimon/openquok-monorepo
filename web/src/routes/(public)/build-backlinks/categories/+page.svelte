<script lang="ts">
	import type { PageData } from './$types';

	import {
		getRootPathPublicBuildBacklinks,
		getRootPathPublicBuildBacklinksCategory
	} from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { route, url } from '$lib/utils/path';

	import { Card, CardContent, CardHeader } from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let categories = $derived(data.categories);
	let schemaData = $derived(data.schemaData);

	const hubHref = url(route(getRootPathPublicBuildBacklinks()));

	function categoryHref(slug: string): string {
		return url(route(getRootPathPublicBuildBacklinksCategory(slug)));
	}

	function siteCountLabel(count: number): string {
		return count === 1 ? '1 site' : `${count} sites`;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="space-y-2">
						<p class="text-xs font-semibold uppercase tracking-wide text-primary">Build backlinks</p>
						<h1 class="text-3xl font-bold">All categories</h1>
					</div>
					<Button variant="outline" href={hubHref}>View all opportunities</Button>
				</div>

				{#if !categories.length}
					<p class="text-base-content/70">No backlink categories available yet.</p>
				{:else}
					<p class="mb-8 text-base-content/70">
						Browse platforms and directories by category — each site lists ways to earn links.
					</p>
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each categories as category (category.id)}
							<a href={categoryHref(category.slug)} class="block">
								<Card class="h-full transition-all hover:shadow-md">
									<CardHeader>
										<h2 class="text-xl font-semibold">{category.name}</h2>
										<p class="text-sm text-base-content/70">
											{siteCountLabel(category.count)}
										</p>
									</CardHeader>
									{#if category.description}
										<CardContent>
											<p class="text-sm text-base-content/70">{category.description}</p>
										</CardContent>
									{/if}
								</Card>
							</a>
						{/each}
					</div>
				{/if}
			</section>
		</SubSectionInnerContainer>
	</SubSectionOuterContainer>
</SectionOuterContainer>
