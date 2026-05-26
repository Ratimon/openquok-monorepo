<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { url } from '$lib/utils/path';
	import { httpGateway } from '$lib/core';

	import { ApiError, HttpMethod } from '$lib/core/HttpGateway';
	import { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
	import { workspaceSettingsPresenter } from '$lib/settings';

	import Button from '$lib/ui/buttons/Button.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountHref = url(`/${rootPathAccount}`);

	// --- OAuth authorize flow (third-party clients) ---
	const clientId = $derived(page.url.searchParams.get('client_id') ?? '');
	const responseType = $derived(page.url.searchParams.get('response_type') ?? 'code');
	const oauthState = $derived(page.url.searchParams.get('state') ?? '');

	const isAuthenticated = $derived(
		page.data?.authStatus === AuthStatus.AUTHENTICATED || page.data?.authStatus === 'authenticated'
	);

	const authChecking = $derived(
		page.data?.authStatus === AuthStatus.UNKNOWN ||
			page.data?.authStatus === AuthStatus.CHECKING ||
			page.data?.authStatus === 'unknown' ||
			page.data?.authStatus === 'checking'
	);

	type AuthorizeGetResponse = {
		app: {
			name: string;
			description: string | null;
			pictureId: string | null;
			clientId: string;
			redirectUrl: string;
		};
		state?: string;
	};

	let loading = $state(false);
	let submitLoading = $state(false);
	let errorMessage = $state(null as string | null);
	let app = $state(null as AuthorizeGetResponse['app'] | null);
	let organizationId = $state('');

	/** True until auth is known and the OAuth app metadata request has finished. */
	const isPreparing = $derived(
		Boolean(clientId) &&
			responseType === 'code' &&
			!errorMessage &&
			!app &&
			(authChecking || loading)
	);

	$effect(() => {
		// Default org selection: current workspace if set and still in the loaded list.
		const ids = new Set(workspaceSettingsPresenter.workspacesVm.map((w) => w.id));
		if (!organizationId && workspaceSettingsPresenter.currentWorkspaceId) {
			const cur = workspaceSettingsPresenter.currentWorkspaceId;
			if (ids.has(cur)) organizationId = cur;
		}
		if (organizationId && !ids.has(organizationId)) {
			organizationId = workspaceSettingsPresenter.workspacesVm[0]?.id ?? '';
		}
	});

	/** Must use `redirectURL` — `getPostSigninRedirectTarget` does not read `returnTo` (same as join-org, public post, etc.). */
	function signInHrefWithReturnTo(): string {
		const target = page.url.pathname + (page.url.search || '');
		return `/sign-in?redirectURL=${encodeURIComponent(target)}`;
	}

	async function loadOAuthAuthorizePage(): Promise<void> {
		if (!clientId) return;
		if (responseType !== 'code') {
			errorMessage = 'Only response_type=code is supported';
			app = null;
			return;
		}

		loading = true;
		errorMessage = null;
		try {
			const qs = new URLSearchParams({ client_id: clientId });
			if (oauthState) qs.set('state', oauthState);
			const { ok, data } = await httpGateway.get<AuthorizeGetResponse>(`/api/v1/oauth/authorize?${qs.toString()}`);
			if (!ok || !data?.app?.clientId) {
				errorMessage = 'Invalid authorization request.';
				app = null;
				return;
			}
			app = data.app;

			const authed =
				page.data?.authStatus === AuthStatus.AUTHENTICATED || page.data?.authStatus === 'authenticated';
			if (authed) {
				await workspaceSettingsPresenter.load({ includeTeam: false });
				if (workspaceSettingsPresenter.workspacesVm.length === 0) {
					await workspaceSettingsPresenter.load({ includeTeam: false });
				}
			}
		} catch (err) {
			if (err instanceof ApiError) {
				const body = err.data as { message?: string; error?: { message?: string } } | undefined;
				const apiMsg = body?.message ?? body?.error?.message;
				if (apiMsg === 'Invalid client_id') {
					errorMessage =
						'This OAuth application is not registered for the API your browser is using. ' +
						'For local CLI auth: sign in on the same Supabase project as backend/.env.development.local, ' +
						'create a developer OAuth app with callback http://localhost:3111/device/callback, ' +
						'and set OPENQUOK_OAUTH_CLIENT_ID / OPENQUOK_OAUTH_CLIENT_SECRET in agent/server/.env.development.local.';
				} else {
					errorMessage = apiMsg ?? err.message;
				}
			} else {
				errorMessage = err instanceof Error ? err.message : 'Failed to load authorization request.';
			}
			app = null;
		} finally {
			loading = false;
		}
	}

	async function submit(action: 'approve' | 'deny'): Promise<void> {
		if (!clientId) {
			errorMessage = 'Missing client_id.';
			return;
		}
		if (!isAuthenticated) {
			void goto(signInHrefWithReturnTo());
			return;
		}
		if (!organizationId && action === 'approve') {
			errorMessage = 'Select a workspace first.';
			return;
		}
		submitLoading = true;
		errorMessage = null;
		try {
			const body: {
				client_id: string;
				organizationId?: string;
				state?: string;
				action: 'approve' | 'deny';
			} = {
				client_id: clientId,
				action,
				...(oauthState ? { state: oauthState } : {})
			};
			if (action === 'approve') {
				body.organizationId = organizationId;
			}
			const { ok, data } = await httpGateway.request<{ redirect: string }>({
				method: HttpMethod.POST,
				url: '/api/v1/oauth/authorize',
				data: body,
				withCredentials: true
			});
			if (!ok || !data?.redirect) {
				errorMessage = 'Authorization failed. Please try again.';
				return;
			}
			window.location.href = data.redirect;
		} catch (err) {
			if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
				void goto(signInHrefWithReturnTo());
				return;
			}
			if (err instanceof ApiError) {
				errorMessage = (err.data as any)?.msg ?? (err.data as any)?.message ?? err.message;
			} else {
				errorMessage = err instanceof Error ? err.message : 'Authorization failed.';
			}
		} finally {
			submitLoading = false;
		}
	}

	$effect(() => {
		if (!clientId || authChecking) return;
		if (responseType !== 'code') {
			errorMessage = 'Only response_type=code is supported';
			app = null;
			return;
		}
		void loadOAuthAuthorizePage();
	});
</script>

<svelte:head>
	<title>Authorize Application - OpenQuok</title>
</svelte:head>

<div class="mx-auto max-w-xl py-10">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6">
		{#if isPreparing}
			<div
				class="flex min-h-[220px] flex-col items-center justify-center gap-4 py-6 text-center"
				role="status"
				aria-live="polite"
				aria-busy="true"
			>
				<img src={url('/icon.svg')} alt="" width="48" height="48" class="h-12 w-12 opacity-80" />
				<span class="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
				<div class="space-y-2">
					<h1 class="text-lg font-semibold text-base-content">Please wait</h1>
					<p class="max-w-sm text-sm text-base-content/70">
						{#if authChecking}
							Checking your session…
						{:else}
							Loading this authorization request…
						{/if}
					</p>
					<p class="text-base-content/55 max-w-sm text-xs">
						The approve screen will appear here in a moment. You can keep this tab open until you
						finish — then return to your terminal or CLI.
					</p>
				</div>
			</div>
		{:else}
			<img src={url('/icon.svg')} alt="" width="48" height="48" class="mb-4 h-12 w-12" />
			<h1 class="text-lg font-semibold text-base-content">Authorize application</h1>

			{#if !clientId}
			<p class="mt-2 text-sm text-base-content/70">
				Missing <span class="font-mono">client_id</span>. This link is not a valid OAuth authorization request.
			</p>
			<p class="mt-4">
				<a class="link link-primary" href={accountHref}>Back to account</a>
			</p>
		{:else if errorMessage}
			<div class="mt-4 rounded-lg border border-error/40 bg-error/10 p-3 text-sm text-base-content">
				{errorMessage}
			</div>
			<p class="mt-4">
				<a class="link link-primary" href={accountHref}>Back to account</a>
			</p>
		{:else if app}
			<p class="mt-2 text-sm text-base-content/70">
				<strong class="text-base-content">{app.name}</strong>
				is requesting access to one of your workspaces.
			</p>
			{#if app.description}
				<p class="mt-2 text-sm text-base-content/70">{app.description}</p>
			{/if}

			{#if !isAuthenticated}
				<p class="mt-5 text-sm text-base-content/70">
					Sign in to choose which workspace this application may access, then approve or deny.
				</p>
				<div class="mt-5 flex flex-wrap gap-2">
					<a class="btn btn-primary" href={signInHrefWithReturnTo()}>Sign in</a>
					<Button variant="outline" disabled={submitLoading} onclick={() => submit('deny')}>
						Deny
					</Button>
				</div>
			{:else}
				<div class="mt-5">
					<label class="text-sm font-medium text-base-content" for="oauth-org">Workspace</label>
					{#if workspaceSettingsPresenter.workspacesVm.length === 0}
						<p class="mt-2 text-sm text-base-content/70">
							You don’t have any workspaces yet. Create one under your account, then return to this page.
						</p>
						<p class="mt-3">
							<a class="link link-primary" href={accountHref}>Go to account → Settings → Workspace</a>
						</p>
					{:else}
						<select
							id="oauth-org"
							class="select select-bordered mt-2 w-full bg-base-100"
							bind:value={organizationId}
						>
							<option value="" disabled>Select a workspace…</option>
							{#each workspaceSettingsPresenter.workspacesVm as w (w.id)}
								<option value={w.id} disabled={w.disabled}>
									{w.name}{w.disabled ? ' (disabled)' : ''}
								</option>
							{/each}
						</select>
						<p class="mt-2 text-xs text-base-content/60">
							You can revoke app access later in <span class="font-medium">Account → Settings → Approved Apps</span>.
						</p>
					{/if}
				</div>

				<div class="mt-6 flex flex-wrap gap-2">
					<Button
						variant="primary"
						disabled={submitLoading || workspaceSettingsPresenter.workspacesVm.length === 0}
						onclick={() => submit('approve')}
					>
						Authorize
					</Button>
					<Button variant="outline" disabled={submitLoading} onclick={() => submit('deny')}>
						Deny
					</Button>
				</div>
			{/if}
		{:else}
			<p class="mt-2 text-sm text-base-content/70">Invalid authorization request.</p>
			<p class="mt-4"><a class="link link-primary" href={accountHref}>Back to account</a></p>
		{/if}
		{/if}
	</div>
</div>

