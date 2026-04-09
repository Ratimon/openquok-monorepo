<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from '$lib/ui/sonner';
	import { absoluteUrl } from '$lib/utils/path';

	import { integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { authenticationRepository } from '$lib/user-auth';

	let loading = $state(true);

	const provider = $derived(page.url.searchParams.get('provider') ?? '');
	const organizationIdParam = $derived(page.url.searchParams.get('organizationId') ?? '');
	const returnTo = $derived(page.url.searchParams.get('returnTo') ?? '/account');

	async function run() {
		loading = true;
		try {
			// Prefer explicit query param, but fall back to current workspace selection.
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				await workspaceSettingsPresenter.load();
			}
			const organizationId = organizationIdParam || workspaceSettingsPresenter.currentWorkspaceId || '';

			if (!provider) {
				toast.error('Missing provider.');
				await goto(absoluteUrl(returnTo), { replaceState: true });
				return;
			}
			if (!organizationId) {
				toast.error('Create or select a workspace before connecting a channel.');
				await goto(absoluteUrl('/account/settings?section=workspace'), { replaceState: true });
				return;
			}

			const res = await integrationsRepository.getAuthorizeUrl({
				organizationId,
				provider
			});

			if (!('url' in res)) {
				toast.error(res.error);
				await goto(absoluteUrl(returnTo), { replaceState: true });
				return;
			}

			authenticationRepository.prepareForOAuthRedirect();
			// Full redirect to provider (outside SPA).
			window.location.href = res.url;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		// run once per navigation
		void run();
	});
</script>

<svelte:head>
	<title>Authorize integration</title>
</svelte:head>

<div class="mx-auto max-w-xl py-10">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6">
		<h1 class="text-lg font-semibold text-base-content">Connecting {provider || 'integration'}…</h1>
		<p class="mt-2 text-sm text-base-content/70">
			{#if loading}
				Preparing authorization…
			{:else}
				Redirecting…
			{/if}
		</p>
	</div>
</div>

