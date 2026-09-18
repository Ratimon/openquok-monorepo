<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';

	import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
	import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let companyName = $derived(
		(typeof data.companyNameVm === 'string' && data.companyNameVm.trim()) || 'OpenQuok'
	);

	// /blog
	const rootPathBlog = getRootPathPublicBlog();
	const blogPath = route(rootPathBlog);
	// /docs
	const rootPathDocs = getRootPathPublicDocs();
	const docsPath = route(rootPathDocs);

	let blogHref = $derived(hostedMarketingHref(blogPath, page.url.origin));
	let docsHref = $derived(hostedMarketingHref(docsPath, page.url.origin));
</script>

<div class="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
	<div class="max-w-lg text-center">
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Scheduled maintenance</h1>
		<p class="mt-4 text-base-content/80">
			{companyName} is paused for a short maintenance window. Sign-in, the workspace, and publishing
			are temporarily unavailable. Public pages stay online.
		</p>
		<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button href={blogHref}>Read the blog</Button>
			<Button href={docsHref} variant="outline">Browse docs</Button>
		</div>
	</div>
</div>
