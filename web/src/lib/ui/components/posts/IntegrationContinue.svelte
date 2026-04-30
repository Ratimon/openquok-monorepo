<script lang="ts">
	import type { ContinueSocialIntegrationViewModel } from '$lib/integrations';
	import type { InstagramBusinessConnectPageRow } from '$lib/integrations/Integrations.repository.svelte';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integration/oauthCallbackPath';
	import { continueIntegrationPresenter, integrationsRepository } from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { authenticationRepository } from '$lib/user-auth';
	import { toast } from '$lib/ui/sonner';
	import { absoluteUrl, route, url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import CircularProgressBar from '$lib/ui/circular-progress-bar/CircularProgressBar.svelte';
	import { ImageWithFallback } from '$lib/ui/images';
	import { icons } from '$data/icon';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	dayjs.extend(utc);
	dayjs.extend(timezone);

	type IgBusinessPickerVm = {
		organizationId: string;
		integrationId: string;
		oauthState: string;
		pages: InstagramBusinessConnectPageRow[];
		successReturnPath: string;
		onboarding: boolean;
	};

	let busy = $state(true);
	/** Signed-out user landed without OAuth callback params — GET authorize requires a session. */
	let signInRequiredForOAuthStart = $state(false);
	/** Signed-out user finished OAuth server-side; prompt sign-in to open `/account`. */
	let oauthAnonymousSuccess = $state<{ provider: string; onboarding: boolean } | null>(null);
	/** Indeterminate-style value for {@link CircularProgressBar} while work is in progress. */
	let progressValue = $state(45);
	/** Inline Instagram (Business) account selection — same route as OAuth callback. */
	let igBusinessPicker = $state<IgBusinessPickerVm | null>(null);
	let submittingIgId = $state<string | null>(null);
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

	function signInHrefForRedirectTarget(targetPathAndQuery: string): string {
		const signIn = getRootPathSignin();
		const redirectURL = encodeURIComponent(route(targetPathAndQuery));
		return absoluteUrl(`/${signIn}?redirectURL=${redirectURL}`);
	}

	let signInToContinueHref = $derived.by(() =>
		signInHrefForRedirectTarget(`${page.url.pathname}${page.url.search}`)
	);

	let signInAfterAnonymousConnectHref = $derived.by(() => {
		const o = oauthAnonymousSuccess;
		if (!o) return '';
		const accountRoot = route(getRootPathAccount());
		const qs = new URLSearchParams({ added: o.provider });
		if (o.onboarding) qs.set('onboarding', 'true');
		return signInHrefForRedirectTarget(`${accountRoot}?${qs}`);
	});

	function oauthContinueAbsolute(providerSlug: string, searchParams?: URLSearchParams): string {
		const path = integrationOAuthCallbackPath(providerSlug);
		if (!searchParams || [...searchParams].length === 0) return absoluteUrl(path);
		return absoluteUrl(`${path}?${searchParams}`);
	}

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
					const pages = data.instagramBusinessPages ?? [];
					if (pages.length === 0) {
						toast.error(
							'No Instagram professional accounts were found. Link Instagram to a Facebook Page in Meta, then try again.'
						);
						await goto(accountUrl, { replaceState: true });
						return;
					}
					igBusinessPicker = {
						organizationId: data.organizationId,
						integrationId: data.id,
						oauthState: authState,
						pages,
						successReturnPath: returnTo,
						onboarding: data.onboarding
					};
					await goto(oauthContinueAbsolute(p), { replaceState: true });
					busy = false;
					return;
				}
				const qs = new URLSearchParams({
					organizationId: data.organizationId,
					returnTo: accountRoot,
					refresh: data.internalId,
					...(onboarding === 'true' && { onboarding: 'true' })
				});
				await goto(oauthContinueAbsolute(p, qs), { replaceState: true });
				return;
			}

			const successQs = new URLSearchParams({ added: p });
			if (data.onboarding) successQs.set('onboarding', 'true');
			if (!authenticationRepository.isAuthenticated()) {
				oauthAnonymousSuccess = { provider: p, onboarding: data.onboarding };
				busy = false;
				return;
			}
			await goto(absoluteUrl(`${accountRoot}?${successQs}`), { replaceState: true });
		} finally {
			busy = false;
		}
	}

	async function selectInstagramBusinessAccount(igId: string) {
		const vm = igBusinessPicker;
		if (!vm) return;
		const row = vm.pages.find((a) => a.id === igId);
		if (!row?.pageId) {
			toast.error('Could not resolve this account.');
			return;
		}
		submittingIgId = igId;
		try {
			const r = await integrationsRepository.saveProviderPage({
				organizationId: vm.organizationId,
				integrationId: vm.integrationId,
				pageId: row.pageId,
				id: row.id,
				state: vm.oauthState
			});
			if (!r.ok) {
				toast.error(r.error);
				return;
			}
			toast.success('Instagram channel connected.');
			const accountRoot = route(getRootPathAccount());
			const successQs = new URLSearchParams({ added: 'instagram-business' });
			if (vm.onboarding) successQs.set('onboarding', 'true');
			if (!authenticationRepository.isAuthenticated()) {
				oauthAnonymousSuccess = { provider: 'instagram-business', onboarding: vm.onboarding };
				igBusinessPicker = null;
				return;
			}
			await goto(absoluteUrl(`${accountRoot}?${successQs}`), { replaceState: true });
			igBusinessPicker = null;
		} catch {
			toast.error('Could not complete setup.');
		} finally {
			submittingIgId = null;
		}
	}

	async function cancelInstagramBusinessPicker() {
		const dest = igBusinessPicker?.successReturnPath ?? route(getRootPathAccount());
		await goto(absoluteUrl(dest), { replaceState: true });
	}

	async function startOAuthRedirect(
		p: string,
		orgParam: string,
		externalReturn: string,
		refreshFromUrl: string | undefined
	) {
		try {
			if (!workspaceSettingsPresenter.currentWorkspaceId) {
				await workspaceSettingsPresenter.load({ includeTeam: false });
			}
			const organizationId = orgParam || workspaceSettingsPresenter.currentWorkspaceId || '';

			// Prevent duplicate redirects on rapid reactivity/navigation updates.
			const redirectKey = `${p}:${organizationId}:${externalReturn}:${onboarding ?? ''}:${refreshFromUrl ?? ''}`;
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
				await goto(absoluteUrl(`${route(getRootPathAccount())}/settings?section=workspace`), {
					replaceState: true
				});
				return;
			}

			const resPm = await integrationsRepository.getAuthorizeUrl({
				organizationId,
				provider: p,
				externalUrl: externalReturn,
				...(refreshFromUrl && { refresh: refreshFromUrl }),
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
		if (oauthAnonymousSuccess) {
			busy = false;
			return;
		}
		if (igBusinessPicker) {
			busy = false;
			return;
		}

		busy = true;
		signInRequiredForOAuthStart = false;
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

		if (browser) {
			try {
				await authenticationRepository.checkAuth(globalThis.fetch);
			} catch {
				/* refresh failure ok — treat as signed out */
			}
		}
		if (!authenticationRepository.isAuthenticated()) {
			signInRequiredForOAuthStart = true;
			busy = false;
			return;
		}

		await startOAuthRedirect(p, orgParam, externalReturn, refreshParam);
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
		>{igBusinessPicker
			? 'Choose Instagram account'
			: oauthAnonymousSuccess
				? 'Channel connected'
				: signInRequiredForOAuthStart
					? 'Sign in to connect'
					: isOAuthErrorCallback
						? 'Connection cancelled'
						: isOAuthSuccessCallback
							? 'Connecting channel'
							: 'Connect channel'}</title
	>
</svelte:head>

{#if igBusinessPicker}
	<div class="mx-auto max-w-lg px-4 py-10">
		<h1 class="text-xl font-semibold text-base-content">Choose an Instagram account</h1>
		<p class="mt-2 text-sm text-base-content/70">
			Select the professional Instagram account linked to your Facebook Page. You can change this later by
			removing and re-adding the channel.
		</p>

		<ul class="mt-6 flex flex-col gap-2">
			{#each igBusinessPicker.pages as a (a.id)}
				<li>
					<button
						type="button"
						class="flex w-full items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-3 text-start hover:bg-base-200 disabled:opacity-60"
						disabled={submittingIgId !== null}
						onclick={() => selectInstagramBusinessAccount(a.id)}
					>
						<div class="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-base-200">
							<ImageWithFallback
								src={a.pictureUrl?.trim() || null}
								alt=""
								class="h-full w-full object-cover"
								fallbackIcon={icons.Instagram.name}
							/>
						</div>
						<span class="min-w-0 flex-1 truncate font-medium text-base-content">{a.name}</span>
						{#if submittingIgId === a.id}
							<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 shrink-0 animate-spin" width="16" height="16" />
						{/if}
					</button>
				</li>
			{/each}
		</ul>
		<Button class="mt-6" variant="ghost" onclick={() => cancelInstagramBusinessPicker()}>Cancel</Button>
	</div>
{:else if oauthAnonymousSuccess}
	<div class="mx-auto max-w-lg px-4 py-10">
		<h1 class="text-xl font-semibold text-base-content">Channel connected</h1>
		<p class="mt-2 text-sm text-base-content/70">
			Your account is linked. Sign in to open your workspace and manage channels.
		</p>
		<Button class="mt-6" href={signInAfterAnonymousConnectHref}>Sign in</Button>
	</div>
{:else if signInRequiredForOAuthStart}
	<div class="mx-auto max-w-lg px-4 py-10">
		<h1 class="text-xl font-semibold text-base-content">Sign in to connect</h1>
		<p class="mt-2 text-sm text-base-content/70">
			Starting this connection requires an Openquok session. Sign in, then try again from your workspace.
		</p>
		<Button class="mt-6" href={signInToContinueHref}>Sign in</Button>
	</div>
{:else}
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
{/if}
