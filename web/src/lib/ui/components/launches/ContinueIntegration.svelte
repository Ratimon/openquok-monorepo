<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { continueIntegrationPresenter } from '$lib/integrations';
	import { toast } from '$lib/ui/sonner';
	import { absoluteUrl } from '$lib/utils/path';

	let submitting = $state(true);

	const provider = $derived(page.params.provider ?? '');
	const code = $derived(page.url.searchParams.get('code') ?? '');
	const oauthState = $derived(page.url.searchParams.get('state') ?? '');
	const refresh = $derived(page.url.searchParams.get('refresh') ?? undefined);

	function timezoneOffsetMinutes(): string {
		return String(-new Date().getTimezoneOffset());
	}

	async function run() {
		submitting = true;
		try {
			const accountUrl = absoluteUrl(getRootPathAccount());

			if (!provider) {
				toast.error('Missing provider.');
				await goto(accountUrl, { replaceState: true });
				return;
			}

			if (!code || !oauthState) {
				toast.error('Missing OAuth parameters.');
				await goto(accountUrl, { replaceState: true });
				return;
			}

			const result = await continueIntegrationPresenter.continueSocialIntegration({
				provider,
				code,
				state: oauthState,
				timezone: timezoneOffsetMinutes(),
				...(refresh && { refresh })
			});

			if (continueIntegrationPresenter.showToastMessage) {
				if (continueIntegrationPresenter.toastKind === 'success') toast.success(continueIntegrationPresenter.toastMessage);
				else toast.error(continueIntegrationPresenter.toastMessage);
			}

			await goto(accountUrl, { replaceState: true });
			return result;
		} finally {
			submitting = false;
		}
	}

	$effect(() => {
		void run();
	});
</script>

<svelte:head>
	<title>Connecting channel</title>
</svelte:head>

<div class="mx-auto max-w-xl py-10">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6">
		<h1 class="text-lg font-semibold text-base-content">Finishing connection…</h1>
		<p class="mt-2 text-sm text-base-content/70">
			{submitting ? 'Please wait while we connect your account.' : 'Done.'}
		</p>
	</div>
</div>

