<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { url } from '$lib/utils/path';

	import { Card, CardContent, CardHeader } from '$lib/ui/card';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	// /blog
	const rootPathPublicBlog = getRootPathPublicBlog();

	const PAGE_TITLE = 'Blog Topics';
	const PAGE_DESCRIPTION =
		'Explore our diverse range of blog topics and find content that interests you.';
	const NO_TOPICS = 'No blog topics available at the moment.';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let topics = $derived(data.topics);

	function topicListingHref(topicId: string): string {
		return url(`/${rootPathPublicBlog}?topic=${encodeURIComponent(topicId)}`);
	}

	function postCountLabel(count: number): string {
		return count === 1 ? '1 post' : `${count} posts`;
	}
</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<h1 class="mb-8 text-3xl font-bold">
					{PAGE_TITLE}</h1>

				{#if !topics.length}
					<p class="text-base-content/70">
						{NO_TOPICS}</p>
				{:else}
					<p class="text-base-content/70 mb-8">
						{PAGE_DESCRIPTION}</p>
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each topics as topic (topic.id)}
							<a href={topicListingHref(topic.id)} class="block">
								<Card class="transition-all hover:shadow-md h-full">
									<CardHeader>
										<h2 class="text-xl font-semibold">
											{topic.name}</h2>
										<p class="text-sm text-base-content/70">
											{postCountLabel(topic.postCount)}</p>
									</CardHeader>
									{#if topic.description}
										<CardContent>
											<p class="text-sm text-base-content/70">
												{topic.description}</p>
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
