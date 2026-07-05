<script lang="ts">
	import type { PageData } from './$types';

	import {
		getRootPathPublicPlaybooks,
		getRootPathPublicPlaybooksTag
	} from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { route, url } from '$lib/utils/path';
	import { stringToSlug } from '$lib/ui/helpers/common';

	import { Card, CardHeader } from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';
	import ListingsPublicHubNav from '$lib/ui/templates/extensions/ListingsPublicHubNav.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let tagFilterVm = $derived(data.tagFilterVm);

	const playbooksHubHref = url(route(getRootPathPublicPlaybooks()));

	function tagHref(slug: string): string {
		return url(route(getRootPathPublicPlaybooksTag(slug)));
	}

	function listingCountLabel(count: number): string {
		return count === 1 ? '1 playbook' : `${count} playbooks`;
	}

	const groupedTags = $derived.by(() => {
		const groups = new Map<string, typeof tagFilterVm.tags>();
		for (const tag of tagFilterVm.tags) {
			const groupName = tag.groupSlugs[0] ?? 'Other';
			const label =
				tagFilterVm.groups.find((group) => group.slug === groupName)?.label ?? 'Other';
			const existing = groups.get(label) ?? [];
			existing.push(tag);
			groups.set(label, existing);
		}
		return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
	});
</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div class="space-y-2">
						<p class="text-xs font-bold tracking-wider text-primary uppercase sm:text-sm">Playbooks</p>
						<h1 class="text-3xl font-bold">All Tags</h1>
					</div>
					<Button variant="outline" href={playbooksHubHref}>View all playbooks</Button>
				</div>

				<ListingsPublicHubNav active="playbooks" class="mb-6" />

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
					<p class="text-base-content/70">No playbook tags available yet.</p>
				{:else}
					<p class="mb-8 text-base-content/70">
						Browse playbooks by tag — platforms, use cases, and catalog labels.
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
