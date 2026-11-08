<script lang="ts">
	import type { PageData } from './$types';

	import {
		getRootPathPublicAlternatives,
		getRootPathPublicAlternativesCategory
	} from '$lib/area-public/constants/getRootPathPublicAlternatives';
	import { route, url } from '$lib/utils/path';

	import { Card, CardContent, CardHeader } from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import PublicAlternativesLandingBreadcrumb from '$lib/ui/templates/landing-page/PublicAlternativesLandingBreadcrumb.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let categories = $derived(data.categories);
	let schemaData = $derived(data.schemaData);

	const hubHref = url(route(getRootPathPublicAlternatives()));

	function categoryHref(slug: string): string {
		return url(route(getRootPathPublicAlternativesCategory(slug)));
	}

	function entryCountLabel(count: number): string {
		return count === 1 ? '1 alternative page' : `${count} alternative pages`;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="space-y-2">
						<PublicAlternativesLandingBreadcrumb variant="categories-index" />
						<h1 class="text-3xl font-bold">All alternatives categories</h1>
					</div>
					<Button variant="outline" href={hubHref}>View all alternatives</Button>
				</div>

				{#if !categories.length}
					<p class="text-base-content/70">No alternative categories available yet.</p>
				{:else}
					<p class="mb-8 text-base-content/70">
						Browse schedulers and directory services by category — each hub lists ranked
						alternatives with prices and compare links.
					</p>
					<div class="grid gap-6 sm:grid-cols-2">
						{#each categories as category (category.slug)}
							<a href={categoryHref(category.slug)} class="block">
								<Card class="h-full transition-all hover:shadow-md">
									<CardHeader>
										<h2 class="text-xl font-semibold">{category.name}</h2>
										<p class="text-sm text-base-content/70">
											{entryCountLabel(category.entryCount)}
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
