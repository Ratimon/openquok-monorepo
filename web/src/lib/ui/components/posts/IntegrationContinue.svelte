<script lang="ts">
	import type { ContinueSocialIntegrationViewModel } from '$lib/integrations';
	import type { TwoStepPickerViewModel } from '$lib/integrations/continue-provider';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';

	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import {
		continueIntegrationPresenter,
		getContinueProviderConfig,
		integrationsRepository
	} from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { authenticationRepository } from '$lib/user-auth';
	import { toast } from '$lib/ui/sonner';
	import { socialProviderDisplayLabel } from '$data/social-providers';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CircularProgressBar from '$lib/ui/circular-progress-bar/CircularProgressBar.svelte';
	import ContinueProviderPicker from '$lib/ui/components/posts/providers/ContinueProviderPicker.svelte';
	import GoogleApiPrivacyNotice from '$lib/ui/components/legal/GoogleApiPrivacyNotice.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = route(rootPathSignIn);

	dayjs.extend(utc);
	dayjs.extend(timezone);

	let busy = $state(true);
	/** Signed-out user landed without OAuth callback params — GET authorize requires a session. */
	let signInRequiredForOAuthStart = $state(false);
	/** Signed-out user finished OAuth server-side; prompt sign-in to open `/account`. */
	let oauthAnonymousSuccess = $state<{ provider: string; onboarding: boolean } | null>(null);
	/** Indeterminate-style value for {@link CircularProgressBar} while work is in progress. */
	let progressValue = $state(45);
	/** Inline two-step provider selection — same route as OAuth callback. */
	let twoStepPicker = $state<TwoStepPickerViewModel | null>(null);
	let submittingPageId = $state<string | null>(null);
	/**
	 * Guard against duplicate effect runs causing multiple OAuth callback submissions.
	 * Backend treats OAuth state as single-use (it deletes the cached state on first success path).
	 */
	let lastHandledOAuthCallbackKey = $state<string | null>(null);
	let startedOAuthRedirectKey = $state<string | null>(null);

	const provider = $derived(page.params.provider ?? '');

	const providerLabel = $derived.by(() => {
		const id = provider;
		if (!id) return 'channel';
		return socialProviderDisplayLabel(id);
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
	const returnTo = $derived(page.url.searchParams.get('returnTo') ?? accountPath);
	const onboarding = $derived(page.url.searchParams.get('onboarding') ?? undefined);

	function signInHrefForRedirectTarget(targetPathAndQuery: string): string {
		const redirectURL = encodeURIComponent(route(targetPathAndQuery));
		return absoluteUrl(`${signInPath}?redirectURL=${redirectURL}`);
	}

	let signInToContinueHref = $derived.by(() =>
		signInHrefForRedirectTarget(`${page.url.pathname}${page.url.search}`)
	);

	let signInAfterAnonymousConnectHref = $derived.by(() => {
		const o = oauthAnonymousSuccess;
		if (!o) return '';
		const qs = new URLSearchParams({ added: o.provider });
		if (o.onboarding) qs.set('onboarding', 'true');
		return signInHrefForRedirectTarget(`${accountPath}?${qs}`);
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
			const safeReturn = externalReturn || accountPath;
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
			const accountUrl = absoluteUrl(accountPath);

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

			const accountRoot = accountPath;
			const data: ContinueSocialIntegrationViewModel = connectResult.data;

			if (data.inBetweenSteps && data.internalId && data.organizationId) {
				const stepConfig = getContinueProviderConfig(p);
				if (stepConfig) {
					const pages = data.pages ?? [];
					if (pages.length === 0) {
						toast.error(stepConfig.emptyPagesMessage);
						await goto(accountUrl, { replaceState: true });
						return;
					}
					twoStepPicker = {
						provider: p,
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

	async function selectContinuePage(rowId: string) {
		const vm = twoStepPicker;
		if (!vm) return;
		const stepConfig = getContinueProviderConfig(vm.provider);
		if (!stepConfig) return;

		const row = vm.pages.find((p) => p.id === rowId);
		if (!row) {
			toast.error('Could not resolve this selection.');
			return;
		}
		const validationError = stepConfig.validateRow(row);
		if (validationError) {
			toast.error(validationError);
			return;
		}

		submittingPageId = rowId;
		try {
			const saveParams = stepConfig.toSaveParams(row);
			const resultVm = await integrationsRepository.saveProviderPage({
				organizationId: vm.organizationId,
				integrationId: vm.integrationId,
				...saveParams,
				...(authenticationRepository.isAuthenticated() ? {} : { oauthState: vm.oauthState })
			});
			if (!resultVm.ok) {
				toast.error(resultVm.error);
				return;
			}
			toast.success(stepConfig.successToast);
			const accountRoot = accountPath;
			const successQs = new URLSearchParams({ added: stepConfig.addedQueryProvider });
			if (vm.onboarding) successQs.set('onboarding', 'true');
			if (!authenticationRepository.isAuthenticated()) {
				oauthAnonymousSuccess = { provider: vm.provider, onboarding: vm.onboarding };
				twoStepPicker = null;
				return;
			}
			await goto(absoluteUrl(`${accountRoot}?${successQs}`), { replaceState: true });
			twoStepPicker = null;
		} catch {
			toast.error('Could not complete setup.');
		} finally {
			submittingPageId = null;
		}
	}

	async function cancelContinuePicker() {
		const dest = twoStepPicker?.successReturnPath ?? accountPath;
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
				await goto(absoluteUrl(accountPath), { replaceState: true });
				return;
			}
			if (!organizationId) {
				toast.error('Create or select a workspace before connecting a channel.');
				await goto(absoluteUrl(`${accountPath}/settings?section=workspace`), {
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
		if (twoStepPicker) {
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
		>
		{twoStepPicker
			? (getContinueProviderConfig(twoStepPicker.provider)?.title ?? 'Choose account')
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

{#if twoStepPicker}
	{@const stepConfig = getContinueProviderConfig(twoStepPicker.provider)}
	{#if stepConfig}
		<ContinueProviderPicker
			config={stepConfig}
			pages={twoStepPicker.pages}
			submittingId={submittingPageId}
			onSelect={selectContinuePage}
			onCancel={cancelContinuePicker}
		/>
	{/if}
{:else if oauthAnonymousSuccess}
	<div class="mx-auto max-w-lg px-4 py-10">
		<h1 class="text-xl font-semibold text-base-content">
			Channel connected
		</h1>
		<p class="mt-2 text-sm text-base-content/70">
			Your account is linked. Sign in to open your workspace and manage channels.
		</p>
		<Button class="mt-6" href={signInAfterAnonymousConnectHref}>
			Sign in</Button>
	</div>
{:else if signInRequiredForOAuthStart}
	<div class="mx-auto max-w-lg px-4 py-10">
		<h1 class="text-xl font-semibold text-base-content">
			Sign in to connect</h1>
		<p class="mt-2 text-sm text-base-content/70">
			Starting this connection requires an Openquok session. Sign in, then try again from your workspace.
		</p>
		<Button class="mt-6" href={signInToContinueHref}>
			Sign in</Button>
	</div>
{:else}
	<div class="mx-auto w-full max-w-2xl px-4 py-10 sm:max-w-3xl">
		<div
			class="flex flex-col items-center rounded-lg border border-base-300 bg-base-100 px-8 py-8 text-center sm:px-10"
		>
			{#if isOAuthErrorCallback}
				<h1 class="text-lg font-semibold text-base-content">
					Returning…</h1>
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
				{#if provider === 'youtube'}
					<div class="mt-6 w-full max-w-md text-start">
						<GoogleApiPrivacyNotice />
					</div>
				{/if}
				{#if busy}
					<div class="mt-6 flex justify-center">
						<CircularProgressBar value={progressValue} size={100} strokeWidth={7} />
					</div>
				{/if}
			{:else}
				<h1 class="text-lg font-semibold text-base-content">
					Finishing connection…
				</h1>
				<p class="mt-2 text-sm text-base-content/70">
					Please wait while we connect your account.
				</p>
				<div class="mt-6 flex justify-center">
					<CircularProgressBar value={progressValue} size={100} strokeWidth={7} />
				</div>
			{/if}
		</div>
	</div>
{/if}
