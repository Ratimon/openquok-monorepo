<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { continueIntegrationPresenter, integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { authenticationRepository } from '$lib/user-auth';
	import { toast } from '$lib/ui/sonner';
	import { absoluteUrl, route, url } from '$lib/utils/path';

	dayjs.extend(utc);
	dayjs.extend(timezone);

	let busy = $state(true);

	const provider = $derived(page.params.provider ?? '');
	/** Authorization code returned by the provider (success path). */
	const code = $derived(page.url.searchParams.get('code') ?? '');
	const oauthState = $derived(page.url.searchParams.get('state') ?? '');
	/** RFC 6749 error from provider (e.g. access_denied when user cancels consent). */
	const oauthError = $derived(page.url.searchParams.get('error') ?? '');
	const oauthErrorDescription = $derived(page.url.searchParams.get('error_description') ?? '');
	const isOAuthSuccessCallback = $derived(Boolean(code && oauthState));
	const isOAuthErrorCallback = $derived(Boolean(oauthError));
	const refresh = $derived(page.url.searchParams.get('refresh') ?? undefined);
	const organizationIdParam = $derived(page.url.searchParams.get('organizationId') ?? '');
	const returnTo = $derived(page.url.searchParams.get('returnTo') ?? route(getRootPathAccount()));

	function timezoneOffsetMinutes(): string {
		const zone = dayjs.tz.guess() || 'UTC';
		return String(dayjs.tz(dayjs(), zone).utcOffset());
	}

	function formatOAuthErrorDescription(raw: string): string {
		if (!raw) return '';
		try {
			return decodeURIComponent(raw.replace(/\+/g, ' ')).trim();
		} catch {
			return raw.replace(/\+/g, ' ').trim();
		}
	}

	/** Provider sent an error (denied, etc.): do not start OAuth again or we loop back to consent. */
	async function handleOAuthProviderError(
		p: string,
		externalReturn: string,
		errorCode: string,
		description: string
	) {
		try {
			const safeReturn = externalReturn || route(getRootPathAccount());
			if (errorCode === 'access_denied') {
				toast('Connection cancelled', {
					description: 'You can connect this channel anytime from integrations.'
				});
			} else {
				const detail = formatOAuthErrorDescription(description);
				toast.error(detail || `Could not connect ${p || 'channel'}.`, {
					description: errorCode ? `Error: ${errorCode}` : undefined
				});
			}
			await goto(absoluteUrl(safeReturn), { replaceState: true });
		} finally {
			busy = false;
		}
	}

	async function finishOAuthCallback(
		p: string,
		authCode: string,
		authState: string,
		refreshParam: string | undefined
	) {
		try {
			const accountUrl = absoluteUrl(getRootPathAccount());

			if (!p) {
				toast.error('Missing provider.');
				await goto(accountUrl, { replaceState: true });
				return;
			}

			if (!authCode || !authState) {
				toast.error('Missing OAuth parameters.');
				await goto(accountUrl, { replaceState: true });
				return;
			}

			const connectResult = await continueIntegrationPresenter.continueSocialIntegration({
				provider: p,
				code: authCode,
				state: authState,
				timezone: timezoneOffsetMinutes(),
				...(refreshParam && { refresh: refreshParam })
			});

			if (!connectResult.ok) {
				if (continueIntegrationPresenter.showToastMessage) {
					toast.error(continueIntegrationPresenter.toastMessage);
					continueIntegrationPresenter.showToastMessage = false;
				}
				await goto(accountUrl, { replaceState: true });
				return;
			}

			if (continueIntegrationPresenter.showToastMessage) {
				if (continueIntegrationPresenter.toastKind === 'success') {
					toast.success(continueIntegrationPresenter.toastMessage);
				} else {
					toast.error(continueIntegrationPresenter.toastMessage);
				}
				continueIntegrationPresenter.showToastMessage = false;
			}

			const accountRoot = route(getRootPathAccount());
			const data = connectResult.data;

			if (data.inBetweenSteps && data.internalId && data.organizationId) {
				const qs = new URLSearchParams({
					organizationId: data.organizationId,
					returnTo: accountRoot,
					refresh: data.internalId
				});
				await goto(absoluteUrl(`${accountRoot}/integrations/social/${encodeURIComponent(p)}?${qs}`), {
					replaceState: true
				});
				return;
			}

			const successQs = new URLSearchParams({ added: p });
			if (data.onboarding) successQs.set('onboarding', 'true');
			await goto(absoluteUrl(`${accountRoot}?${successQs}`), { replaceState: true });
		} finally {
			busy = false;
		}
	}

	async function startOAuthRedirect(p: string, orgParam: string, externalReturn: string) {
		try {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				await workspaceSettingsPresenter.load();
			}
			const organizationId = orgParam || workspaceSettingsPresenter.currentWorkspaceId || '';

			if (!p) {
				toast.error('Missing provider.');
				await goto(absoluteUrl(route(getRootPathAccount())), { replaceState: true });
				return;
			}
			if (!organizationId) {
				toast.error('Create or select a workspace before connecting a channel.');
				await goto(absoluteUrl(`${route(getRootPathAccount())}/settings?section=workspace`), { replaceState: true });
				return;
			}

			const resPm = await integrationsRepository.getAuthorizeUrl({
				organizationId,
				provider: p,
				externalUrl: externalReturn
			});

			if (!('url' in resPm)) {
				toast.error(resPm.error);
				await goto(absoluteUrl(externalReturn), { replaceState: true });
				return;
			}

			authenticationRepository.prepareForOAuthRedirect();
			window.location.href = resPm.url;
		} finally {
			busy = false;
		}
	}

	async function run() {
		busy = true;
		const p = provider;
		const authCode = code;
		const authState = oauthState;
		const refreshParam = refresh;
		const orgParam = organizationIdParam;
		const externalReturn = returnTo;
		const err = oauthError;
		const errDesc = oauthErrorDescription;

		if (err) {
			await handleOAuthProviderError(p, externalReturn, err, errDesc);
			return;
		}
		if (authCode && authState) {
			await finishOAuthCallback(p, authCode, authState, refreshParam);
			return;
		}
		await startOAuthRedirect(p, orgParam, externalReturn);
	}

	$effect(() => {
		void run();
	});
</script>

<svelte:head>
	<title
		>{isOAuthErrorCallback
			? 'Connection cancelled'
			: isOAuthSuccessCallback
				? 'Connecting channel'
				: 'Connect channel'}</title
	>
</svelte:head>

<div class="mx-auto max-w-xl py-10">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6">
		{#if isOAuthErrorCallback}
			<h1 class="text-lg font-semibold text-base-content">Returning…</h1>
			<p class="mt-2 text-sm text-base-content/70">
				{busy ? 'Taking you back to your account.' : 'Done.'}
			</p>
		{:else if !isOAuthSuccessCallback}
			<img
				src={url('/icon.svg')}
				alt=""
				width="48"
				height="48"
				class="mb-4 h-12 w-12"
			/>
			<h1 class="text-lg font-semibold text-base-content">Connecting {provider || 'channel'}…</h1>
			<p class="mt-2 text-sm text-base-content/70">
				{#if busy}
					Preparing authorization…
				{:else}
					Redirecting…
				{/if}
			</p>
		{:else}
			<h1 class="text-lg font-semibold text-base-content">Finishing connection…</h1>
			<p class="mt-2 text-sm text-base-content/70">
				{busy ? 'Please wait while we connect your account.' : 'Done.'}
			</p>
		{/if}
	</div>
</div>
