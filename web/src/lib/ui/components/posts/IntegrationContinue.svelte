<script lang="ts">
	import type { ContinueSocialIntegrationViewModel } from '$lib/integrations';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import {
		continueIntegrationPresenter,
		INSTAGRAM_BUSINESS_PICKER_SESSION_KEY,
		integrationsRepository,
	} from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { authenticationRepository } from '$lib/user-auth';
	import { toast } from '$lib/ui/sonner';
	import { absoluteUrl, route, url } from '$lib/utils/path';

	import CircularProgressBar from '$lib/ui/circular-progress-bar/CircularProgressBar.svelte';

	dayjs.extend(utc);
	dayjs.extend(timezone);

	let busy = $state(true);
	/** Indeterminate-style value for {@link CircularProgressBar} while work is in progress. */
	let progressValue = $state(45);
	/**
	 * Guard against duplicate effect runs causing multiple OAuth callback submissions.
	 * Backend treats OAuth state as single-use (it deletes the cached state on first success path).
	 */
	let lastHandledOAuthCallbackKey = $state<string | null>(null);
	let startedOAuthRedirectKey = $state<string | null>(null);

	const provider = $derived(page.params.provider ?? '');

	/** Matches backend `SocialProvider.name`; used when the URL only has the identifier. */
	const PROVIDER_DISPLAY: Record<string, string> = {
		'instagram-standalone': 'Instagram (Standalone)',
		'instagram-business': 'Instagram (Business)',
		threads: 'Threads'
	};

	const providerLabel = $derived.by(() => {
		const id = provider;
		if (PROVIDER_DISPLAY[id]) return PROVIDER_DISPLAY[id];
		if (!id) return 'channel';
		return id
			.split('-')
			.filter(Boolean)
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join(' ');
	});

	/** Split "Instagram (Standalone)" → main + "(Standalone)" for a line break before parentheses. */
	const connectingHeadline = $derived.by(() => {
		const full = providerLabel;
		const m = full.match(/^(.+?)\s+(\([^)]+\))$/);
		if (m) return { main: m[1].trim(), paren: m[2] };
		return { main: full, paren: null as string | null };
	});
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
	const onboarding = $derived(page.url.searchParams.get('onboarding') ?? undefined);

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
			const data: ContinueSocialIntegrationViewModel = connectResult.data;

			if (data.inBetweenSteps && data.internalId && data.organizationId) {
				if (p === 'instagram-business') {
					if (data.instagramBusinessPages?.length && typeof sessionStorage !== 'undefined') {
						try {
							sessionStorage.setItem(
								INSTAGRAM_BUSINESS_PICKER_SESSION_KEY,
								JSON.stringify({
									integrationId: data.id,
									pages: data.instagramBusinessPages,
									state: authState
								})
							);
						} catch {
							/* private / full storage */
						}
					}
					const qs = new URLSearchParams({
						organizationId: data.organizationId,
						integrationId: data.id,
						state: authState,
						returnTo: accountRoot,
						...(onboarding === 'true' && { onboarding: 'true' })
					});
					await goto(absoluteUrl(`${accountRoot}/integrations/instagram-business?${qs}`), {
						replaceState: true
					});
					return;
				}
				const qs = new URLSearchParams({
					organizationId: data.organizationId,
					returnTo: accountRoot,
					refresh: data.internalId,
					...(onboarding === 'true' && { onboarding: 'true' })
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
				await workspaceSettingsPresenter.load({ includeTeam: false });
			}
			const organizationId = orgParam || workspaceSettingsPresenter.currentWorkspaceId || '';

			// Prevent duplicate redirects on rapid reactivity/navigation updates.
			const redirectKey = `${p}:${organizationId}:${externalReturn}:${onboarding ?? ''}`;
			if (startedOAuthRedirectKey === redirectKey) {
				return;
			}
			startedOAuthRedirectKey = redirectKey;

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
				externalUrl: externalReturn,
				...(onboarding === 'true' && { onboarding: 'true' })
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
			// Guard: if effect runs multiple times for the same callback, only submit once.
			const callbackKey = `${p}:${authState}:${authCode}:${refreshParam ?? ''}`;
			if (lastHandledOAuthCallbackKey === callbackKey) {
				busy = false;
				return;
			}
			lastHandledOAuthCallbackKey = callbackKey;
			await finishOAuthCallback(p, authCode, authState, refreshParam);
			return;
		}
		await startOAuthRedirect(p, orgParam, externalReturn);
	}

	$effect(() => {
		void run();
	});

	$effect(() => {
		if (!busy) {
			progressValue = 0;
			return;
		}
		let frame = 0;
		const start = Date.now();
		const tick = () => {
			const t = (Date.now() - start) / 1000;
			progressValue = 55 + 35 * Math.sin(t * 1.6);
			frame = requestAnimationFrame(tick);
		};
		tick();
		return () => cancelAnimationFrame(frame);
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

<div class="mx-auto w-full max-w-2xl px-4 py-10 sm:max-w-3xl">
	<div
		class="flex flex-col items-center rounded-lg border border-base-300 bg-base-100 px-8 py-8 text-center sm:px-10"
	>
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
				class="mb-3 h-12 w-12 shrink-0"
			/>
			<h1 class="w-full text-balance text-lg font-semibold leading-snug text-base-content sm:text-xl">
				<span class="block text-sm font-medium text-base-content/75 sm:text-base">Connecting</span>
				{#if connectingHeadline.paren}
					<span class="mt-2 block sm:mt-3">{connectingHeadline.main}</span>
					<span class="mt-1 block">{connectingHeadline.paren}…</span>
				{:else}
					<span class="mt-2 block sm:mt-3">{connectingHeadline.main}…</span>
				{/if}
			</h1>
			<p class="mt-2 text-sm text-base-content/70">
				{#if busy}
					Redirecting…
				{:else}
					Almost there…
				{/if}
			</p>
			{#if busy}
				<div class="mt-6 flex justify-center">
					<CircularProgressBar value={progressValue} size={100} strokeWidth={7} />
				</div>
			{/if}
		{:else}
			<h1 class="text-lg font-semibold text-base-content">Finishing connection…</h1>
			<p class="mt-2 text-sm text-base-content/70">
				{#if busy}
					Please wait while we connect your account.
				{:else}
					Done.
				{/if}
			</p>
			{#if busy}
				<div class="mt-6 flex justify-center">
					<CircularProgressBar value={progressValue} size={100} strokeWidth={7} />
				</div>
			{/if}
		{/if}
	</div>
</div>
