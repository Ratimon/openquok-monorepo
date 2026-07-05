<script lang="ts">
	import type { PageData } from './$types';

	import {
		getRootPathPublicPlaybooks,
		getRootPathPublicPlaybooksCategory
	} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { route, url } from '$lib/utils/path';

	import { Card, CardContent, CardHeader } from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ListingsPublicHubNav from '$lib/ui/templates/extensions/ListingsPublicHubNav.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let categories = $derived(data.categories);

	const playbooksHubHref = url(route(getRootPathPublicPlaybooks()));

	function categoryHref(slug: string): string {
		return url(route(getRootPathPublicPlaybooksCategory(slug)));
	}

	function listingCountLabel(count: number): string {
		return count === 1 ? '1 playbook' : `${count} playbooks`;
	}
</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="space-y-2">
						<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">Playbooks</p>
						<h1 class="text-3xl font-bold">All Categories</h1>
					</div>
					<Button variant="outline" href={playbooksHubHref}>View all playbooks</Button>
				</div>

				<ListingsPublicHubNav active="playbooks" class="mb-6" />

				{#if !categories.length}
					<p class="text-base-content/70">No playbook categories available yet.</p>
				{:else}
					<p class="mb-8 text-base-content/70">
						Browse playbooks by category — agent workflows grouped by topic and use case.
					</p>
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each categories as category (category.id)}
							<a href={categoryHref(category.slug)} class="block">
								<Card class="h-full transition-all hover:shadow-md">
									<CardHeader>
										<h2 class="text-xl font-semibold">{category.name}</h2>
										<p class="text-sm text-base-content/70">
											{listingCountLabel(category.count)}
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
