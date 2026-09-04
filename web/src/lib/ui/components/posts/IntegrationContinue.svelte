<script lang="ts">
	import type { ContinueSocialIntegrationViewModel } from '$lib/integrations';
	import type { IntegrationCatalogCustomField } from '$lib/integrations/utils/credentialsConnect';
	import type { TwoStepPickerViewModel } from '$lib/integrations/continue-provider';

	import { absoluteUrl, route, url } from '$lib/utils/path';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { integrationOAuthCallbackPath } from '$lib/integrations/utils/oauthCallbackPath';
	import {
		DEFAULT_API_KEY_CUSTOM_FIELDS,
		catalogItemHasCustomFields,
		encodeCredentialsConnectCode,
		isExternalHttpUrl,
		normalizeCatalogCustomFields,
		timezoneOffsetMinutes
	} from '$lib/integrations/utils/credentialsConnect';
	import {
		buildAllPagesConnectedMessage,
		continueIntegrationPresenter,
		filterContinuePickerPages,
		getContinueProviderConfig,
		integrationsRepository,
		resolveAccountConflictForFilteredPages
	} from '$lib/integrations';
	import { workspaceSettingsPresenter } from '$lib/settings';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { authenticationRepository } from '$lib/user-auth';
	import { toast } from '$lib/ui/sonner';
	import { socialProviderDisplayLabel } from '$data/social-providers';
	import Button from '$lib/ui/buttons/Button.svelte';
	import CircularProgressBar from '$lib/ui/circular-progress-bar/CircularProgressBar.svelte';
	import ContinueProviderPicker from '$lib/ui/components/posts/providers/ContinueProviderPicker.svelte';
	import CredentialsConnectForm from '$lib/ui/components/posts/CredentialsConnectForm.svelte';
	import GoogleApiPrivacyNotice from '$lib/ui/components/legal/GoogleApiPrivacyNotice.svelte';
	import TiktokApiPrivacyNotice from '$lib/ui/components/legal/TiktokApiPrivacyNotice.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = route(rootPathSignIn);

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
	let removingConflictChannel = $state(false);
	/**
	 * Guard against duplicate effect runs causing multiple OAuth callback submissions.
	 * Backend treats OAuth state as single-use (it deletes the cached state on first success path).
	 */
	let lastHandledOAuthCallbackKey = $state<string | null>(null);
	let startedOAuthRedirectKey = $state<string | null>(null);
	/** API-key channels (no OAuth redirect) — show the credentials form instead of `window.location`. */
	let credentialsActive = $state(false);
	let credentialsFields = $state<IntegrationCatalogCustomField[]>([]);
	let credentialsSubmitting = $state(false);
	/** Authorize `url` already fetched (non-http state). Reused on submit so state stays single-use. */
	let credentialsAuthorizeState = $state<string | null>(null);

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
	/** X OAuth 1.0a callback params (mapped to code/state for the generic connect flow). */
	const xOAuthToken = $derived(page.url.searchParams.get('oauth_token') ?? '');
	const xOAuthVerifier = $derived(page.url.searchParams.get('oauth_verifier') ?? '');
	const effectiveOAuthCode = $derived.by(() => {
		if (provider === 'x') return code || xOAuthVerifier;
		return code;
	});
	const effectiveOAuthState = $derived.by(() => {
		if (provider === 'x') return oauthState || xOAuthToken;
		return oauthState;
	});
	/** RFC 6749 error from provider (e.g. access_denied when user cancels consent). */
	const oauthError = $derived(page.url.searchParams.get('error') ?? '');
	const oauthErrorDescription = $derived(page.url.searchParams.get('error_description') ?? '');
	const isOAuthSuccessCallback = $derived(Boolean(effectiveOAuthCode && effectiveOAuthState));
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

					const connectedIntegrations = await integrationsRepository.listConnectedIntegrations(
						data.organizationId
					);
					const { pages: availablePages, allFilteredAsAlreadyConnected } =
						filterContinuePickerPages({
							pages,
							connectedIntegrations,
							excludeIntegrationId: data.id
						});

					let emptyStateMessage: string | undefined;
					let accountConflict: TwoStepPickerViewModel['accountConflict'];
					if (availablePages.length === 0) {
						if (allFilteredAsAlreadyConnected && stepConfig.allPagesConnectedMessage) {
							emptyStateMessage = buildAllPagesConnectedMessage({
								originalPages: pages,
								connectedIntegrations,
								connectingProviderIdentifier: p,
								fallbackMessage: stepConfig.allPagesConnectedMessage
							});
							accountConflict = resolveAccountConflictForFilteredPages({
								originalPages: pages,
								connectedIntegrations,
								excludeIntegrationId: data.id,
								connectingProviderIdentifier: p,
								fallbackMessage: stepConfig.allPagesConnectedMessage
							});
						} else {
							toast.error(stepConfig.emptyPagesMessage);
							await goto(accountUrl, { replaceState: true });
							return;
						}
					}

					twoStepPicker = {
						provider: p,
						organizationId: data.organizationId,
						integrationId: data.id,
						oauthState: authState,
						allPages: pages,
						pages: availablePages,
						...(emptyStateMessage && { emptyStateMessage }),
						...(accountConflict && { accountConflict }),
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
				if (
					resultVm.errorCode === 'INTEGRATION_ACCOUNT_CONFLICT' &&
					resultVm.conflictIntegrationId
				) {
					twoStepPicker = {
						...vm,
						pages: [],
						emptyStateMessage: resultVm.error,
						accountConflict: {
							message: resultVm.error,
							existingIntegrationId: resultVm.conflictIntegrationId,
							existingProviderIdentifier: resultVm.existingProviderIdentifier ?? '',
							accountLabel: row.name
						}
					};
					return;
				}
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

	async function removeConflictingChannelAndContinue() {
		const vm = twoStepPicker;
		const conflict = vm?.accountConflict;
		if (!vm || !conflict) return;

		removingConflictChannel = true;
		try {
			const del = await integrationsRepository.deleteChannel({
				organizationId: vm.organizationId,
				integrationId: conflict.existingIntegrationId
			});
			if (!del.ok) {
				toast.error(del.error);
				return;
			}

			toast.success('Channel removed.');

			const sourcePages = vm.allPages ?? vm.pages;
			if (sourcePages.length > 0) {
				const connectedIntegrations = await integrationsRepository.listConnectedIntegrations(
					vm.organizationId
				);
				const { pages: availablePages, allFilteredAsAlreadyConnected } = filterContinuePickerPages({
					pages: sourcePages,
					connectedIntegrations,
					excludeIntegrationId: vm.integrationId
				});

				if (availablePages.length > 0) {
					twoStepPicker = {
						...vm,
						allPages: sourcePages,
						pages: availablePages,
						emptyStateMessage: undefined,
						accountConflict: undefined
					};
					return;
				}

				const stepConfig = getContinueProviderConfig(vm.provider);
				if (allFilteredAsAlreadyConnected && stepConfig?.allPagesConnectedMessage) {
					const emptyStateMessage = buildAllPagesConnectedMessage({
						originalPages: sourcePages,
						connectedIntegrations,
						connectingProviderIdentifier: vm.provider,
						fallbackMessage: stepConfig.allPagesConnectedMessage
					});
					twoStepPicker = {
						...vm,
						allPages: sourcePages,
						pages: [],
						emptyStateMessage,
						accountConflict: resolveAccountConflictForFilteredPages({
							originalPages: sourcePages,
							connectedIntegrations,
							excludeIntegrationId: vm.integrationId,
							connectingProviderIdentifier: vm.provider,
							fallbackMessage: stepConfig.allPagesConnectedMessage
						})
					};
					return;
				}
			}

			twoStepPicker = null;
			lastHandledOAuthCallbackKey = null;
			startedOAuthRedirectKey = null;
			busy = true;
			await startOAuthRedirect(vm.provider, vm.organizationId, vm.successReturnPath, undefined);
		} finally {
			removingConflictChannel = false;
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

			if (!isExternalHttpUrl(resPm.url)) {
				credentialsAuthorizeState = resPm.url;
				if (credentialsFields.length === 0) {
					credentialsFields = DEFAULT_API_KEY_CUSTOM_FIELDS;
				}
				credentialsActive = true;
				busy = false;
				return;
			}

			authenticationRepository.prepareForOAuthRedirect();
			window.location.href = resPm.url;
		} finally {
			busy = false;
		}
	}

	async function detectCredentialsProvider(p: string): Promise<boolean> {
		try {
			const catalog = await integrationsRepository.getCatalog();
			const item = catalog.find((row) => row.identifier === p);
			if (!catalogItemHasCustomFields(item)) return false;
			credentialsFields = normalizeCatalogCustomFields(item?.customFields);
			credentialsActive = true;
			return true;
		} catch {
			return false;
		}
	}

	async function submitCredentials(values: Record<string, string>) {
		const p = provider;
		credentialsSubmitting = true;
		busy = true;
		try {
			let state = credentialsAuthorizeState;
			if (!state) {
				if (!workspaceSettingsPresenter.currentWorkspaceId) {
					await workspaceSettingsPresenter.load({ includeTeam: false });
				}
				const organizationId =
					organizationIdParam || workspaceSettingsPresenter.currentWorkspaceId || '';
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
					externalUrl: returnTo,
					...(refresh && { refresh }),
					...(onboarding === 'true' && { onboarding: 'true' })
				});
				if (!('url' in resPm)) {
					toast.error(resPm.error);
					return;
				}
				state = resPm.url;
				credentialsAuthorizeState = state;
			}
			await finishOAuthCallback(p, encodeCredentialsConnectCode(values), state, refresh);
		} finally {
			credentialsSubmitting = false;
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
		if (credentialsActive) {
			busy = false;
			return;
		}

		busy = true;
		signInRequiredForOAuthStart = false;
		const p = provider;
		const authCode = effectiveOAuthCode;
		const authState = effectiveOAuthState;
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

		if (await detectCredentialsProvider(p)) {
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
				: credentialsActive
					? `Connect ${providerLabel}`
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
			emptyStateMessage={twoStepPicker.emptyStateMessage}
			accountConflict={twoStepPicker.accountConflict}
			submittingId={submittingPageId}
			removingConflict={removingConflictChannel}
			onSelect={selectContinuePage}
			onRemoveConflict={() => void removeConflictingChannelAndContinue()}
			onCancel={cancelContinuePicker}
		/>
	{/if}
{:else if credentialsActive}
	<div class="mx-auto max-w-lg px-4 py-10">
		<h1 class="text-xl font-semibold text-base-content">Connect {providerLabel}</h1>
		<div class="mt-6 rounded-lg border border-base-300 bg-base-100 p-6">
			<CredentialsConnectForm
				providerName={providerLabel}
				fields={credentialsFields}
				submitting={credentialsSubmitting}
				onSubmit={submitCredentials}
				onCancel={() => goto(absoluteUrl(returnTo), { replaceState: true })}
			/>
		</div>
	</div>
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
			Starting this connection requires an OpenQuok session. Sign in, then try again from your workspace.
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
				{#if provider === 'youtube'}
					<div class="mt-4 w-full max-w-md text-start">
						<GoogleApiPrivacyNotice />
					</div>
				{:else if provider === 'tiktok'}
					<div class="mt-4 w-full max-w-md text-start">
						<TiktokApiPrivacyNotice />
					</div>
				{/if}
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
