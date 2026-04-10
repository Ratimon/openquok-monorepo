<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { absoluteUrl, route, url } from '$lib/utils/path';

	/**
	 * App-level OAuth authorize (e.g. third-party clients), not workspace channel connect.
	 * Legacy links that used `provider` + `organizationId` for social connect are forwarded to integrations.
	 */
	const legacyProvider = $derived(page.url.searchParams.get('provider') ?? '');
	const legacyOrganizationId = $derived(page.url.searchParams.get('organizationId') ?? '');
	const legacyReturnTo = $derived(page.url.searchParams.get('returnTo') ?? '');

	$effect(() => {
		if (!legacyProvider || !legacyOrganizationId) return;
		const accountRoot = route(getRootPathAccount());
		const qs = new URLSearchParams({ organizationId: legacyOrganizationId });
		if (legacyReturnTo) qs.set('returnTo', legacyReturnTo);
		void goto(
			absoluteUrl(`${accountRoot}/integrations/social/${encodeURIComponent(legacyProvider)}?${qs}`),
			{ replaceState: true }
		);
	});
</script>

<svelte:head>
	<title>Authorize application</title>
</svelte:head>

<div class="mx-auto max-w-xl py-10">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6">
		<img
			src={url('/icon.svg')}
			alt=""
			width="48"
			height="48"
			class="mb-4 h-12 w-12"
		/>
		<h1 class="text-lg font-semibold text-base-content">Authorize application</h1>
		<p class="mt-2 text-sm text-base-content/70">
			This page is reserved for application-level OAuth (for example when a third-party client requests access).
			Connecting a social channel happens under <span class="font-medium text-base-content">Account → Integrations</span>.
		</p>
		{#if legacyProvider && legacyOrganizationId}
			<p class="mt-3 text-sm text-base-content/70">Redirecting to channel connect…</p>
		{:else}
			<p class="mt-4">
				<a class="link link-primary" href={url(`/${getRootPathAccount()}`)}>Back to account</a>
			</p>
		{/if}
	</div>
</div>
