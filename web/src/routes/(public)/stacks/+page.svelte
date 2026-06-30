<script lang="ts">
	import type { PageData } from './$types';

	import { goto } from '$app/navigation';
	import { getRootPathPublicStack } from '$lib/area-public/constants/getRootPathPublicStacks';
	import { url } from '$lib/utils/path';

	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let stacksVm = $derived(data.stacksVm);
	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let searchTerm = $derived(data.searchTerm ?? '');
	let searchDraft = $state('');

	$effect(() => {
		searchDraft = searchTerm;
	});

	function applySearch() {
		const params = new URLSearchParams();
		const term = searchDraft.trim();
		if (term) params.set('search', term);
		const href = params.toString() ? `?${params.toString()}` : '';
		void goto(href, { keepFocus: true, noScroll: true });
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Stacks</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{metaTitle}</h1>
		<p class="mx-auto max-w-3xl text-base text-base-content/70">{metaDescription}</p>
		<form class="mx-auto flex max-w-xl gap-2 pt-2" onsubmit={(e) => { e.preventDefault(); applySearch(); }}>
			<input
				class="input input-bordered w-full"
				placeholder="Search stacks…"
				bind:value={searchDraft}
			/>
			<button type="submit" class="btn btn-primary">Search</button>
		</form>
	</header>

	<section class="container mx-auto mt-10 max-w-6xl px-4">
		{#if stacksVm.length === 0}
			<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
				No published stacks match your search yet.
			</p>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each stacksVm as stack (stack.id)}
					<li>
						<a
							class="block h-full rounded-2xl border border-base-content/10 p-5 transition hover:border-primary/40 hover:shadow-md"
							href={url(getRootPathPublicStack(stack.slug))}
						>
							<h2 class="text-lg font-semibold text-base-content">{stack.title}</h2>
							{#if stack.excerpt}
								<p class="mt-2 line-clamp-3 text-sm text-base-content/70">{stack.excerpt}</p>
							{/if}
							<p class="mt-4 text-xs text-base-content/50">
								{stack.memberCount} members · {stack.likes} likes
							</p>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</SectionOuterContainer>
