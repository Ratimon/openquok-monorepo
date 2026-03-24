<script lang="ts">
	import type { PageData } from './$types';

	import { getRootPathPublicBlogAuthor } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { url } from '$lib/utils/path';
	import { stringToSlug } from '$lib/ui/helpers/common';

	import * as Avatar from '$lib/ui/components/avatar';
	import SupabaseUserAvatar from '$lib/ui/supabase/SupabaseUserAvatar.svelte';
	import { Card, CardContent, CardHeader } from '$lib/ui/card';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SubSectionInnerContainer from '$lib/ui/layouts/SubSectionInnerContainer.svelte';
	import SubSectionOuterContainer from '$lib/ui/layouts/SubSectionOuterContainer.svelte';

	/** From `en.ts` — blog.blog-authors-overview-page */
	const PAGE_TITLE = 'Blog Authors';
	const PAGE_DESCRIPTION = 'Meet our talented blog authors.';
	const NO_AUTHORS = 'No authors found.';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	let authors = $derived(data.authors);

	function authorHref(author: (typeof authors)[number]): string {
		const segment = stringToSlug(author.fullName || author.username || 'Anonymous');
		return url(`/${getRootPathPublicBlogAuthor(segment)}`);
	}

	function displayName(author: (typeof authors)[number]): string {
		return author.fullName || author.username || 'Anonymous';
	}

	function postCountLabel(count: number): string {
		return count === 1 ? '1 Post' : `${count} Posts`;
	}
</script>

<SectionOuterContainer class="bg-base-100">
	<SubSectionOuterContainer class="md:py-10">
		<SubSectionInnerContainer class="max-w-7xl py-8">
			<section class="flex flex-col gap-2">
				<h1 class="mb-8 text-3xl font-bold">{PAGE_TITLE}</h1>

				{#if !authors.length}
					<p class="text-base-content/70">{NO_AUTHORS}</p>
				{:else}
					<p class="text-base-content/70 mb-8">{PAGE_DESCRIPTION}</p>
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each authors as author (author.id)}
							<a href={authorHref(author)} class="block">
								<Card class="h-full transition-all hover:shadow-md">
									<CardHeader class="flex flex-row items-center gap-4">
										<Avatar.Root class="size-16 shrink-0 rounded-full">
											<SupabaseUserAvatar
												url={author.avatarUrl}
												size={64}
												alt={displayName(author)}
												imageOnly
											/>
											<Avatar.Fallback>
												{displayName(author).charAt(0).toUpperCase()}
											</Avatar.Fallback>
										</Avatar.Root>
										<div>
											<h2 class="text-xl font-semibold">{displayName(author)}</h2>
											<p class="text-sm text-base-content/70">{postCountLabel(author.postCount)}</p>
										</div>
									</CardHeader>
									{#if author.tagLine}
										<CardContent>
											<p class="text-sm text-base-content/70">{author.tagLine}</p>
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
