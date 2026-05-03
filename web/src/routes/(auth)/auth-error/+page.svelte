<script lang="ts">
	import type { PageProps } from './$types';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { absoluteUrl } from '$lib/utils/path';
	import Button from '$lib/ui/buttons/Button.svelte';

	const signinUrl = absoluteUrl(`/${getRootPathSignin()}`);

	let { data }: PageProps = $props();
	let errorMessage = $derived(data?.errorMessage ?? 'An error occurred.');
</script>

<div class="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
	<div class="max-w-md text-center">
		<h1 class="text-2xl font-bold tracking-tight text-warning sm:text-3xl">
			Authentication Error</h1>
		<p class="mt-4 text-base-content/80">
			We're sorry, but there was a problem with your authentication. Please try again. If the issue persists, contact support.
		</p>
		<p class="mt-4 font-medium text-primary">
			{errorMessage}</p>
		<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button href={signinUrl}>
				Try signing in again</Button>
			<Button href="/" variant="outline">
				Return home</Button>
		</div>
	</div>
</div>
