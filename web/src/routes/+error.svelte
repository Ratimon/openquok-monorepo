<script lang="ts">
	import { page } from '$app/state';

	let companyName = $derived((page.data as App.LayoutData)?.companyNameVm ?? 'OpenQuok');
	let status = $derived(page.status);
	let isNotFound = $derived(status === 404);
	let title = $derived(isNotFound ? 'Page not found' : 'Something went wrong');
</script>

<svelte:head>
	<title>{title} | {companyName}</title>
</svelte:head>

<section class="min-h-screen">
	<div class="w-full py-14">
		<div class="mx-auto max-w-2xl text-center">
			<h1 class="text-2xl font-semibold">
				{isNotFound ? 'Page Not Found' : 'Something went wrong'}
			</h1>
			<p class="py-12 text-7xl font-extrabold">
				{status}
			</p>
			<p class="py-4 text-lg italic text-primary">
				{isNotFound
					? "The page you're looking for doesn't exist or has been moved."
					: 'This page failed to load. Try again in a moment.'}
			</p>
			<a href="/" class="text-lg text-primary underline">Return Home</a>
		</div>
	</div>
</section>
