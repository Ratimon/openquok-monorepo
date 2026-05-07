<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getRootPathAccount } from '$lib/area-protected';
	import { url } from '$lib/utils/path';
	import { httpGateway } from '$lib/core';

	import { ApiError, HttpMethod } from '$lib/core/HttpGateway';
	import { settingsRepository, workspaceSettingsPresenter } from '$lib/settings';
	
	import Button from '$lib/ui/buttons/Button.svelte';

	// /account
	const rootPathAccount = getRootPathAccount();
	const accountHref = url(`/${rootPathAccount}`);

	// --- OAuth authorize flow (third-party clients) ---
	const clientId = $derived(page.url.searchParams.get('client_id') ?? '');
	const responseType = $derived(page.url.searchParams.get('response_type') ?? 'code');
	const oauthState = $derived(page.url.searchParams.get('state') ?? '');

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

	$effect(() => {
		// Default org selection: current workspace if set.
		if (!organizationId && workspaceSettingsPresenter.currentWorkspaceId) {
			organizationId = workspaceSettingsPresenter.currentWorkspaceId;
		}
	});

	function signInHrefWithReturnTo(): string {
		const returnTo = page.url.pathname + (page.url.search || '');
		const qs = new URLSearchParams({ returnTo });
		return `/sign-in?${qs.toString()}`;
	}

	async function loadAuthorizeApp(): Promise<void> {
		if (!clientId) return;
		if (responseType !== 'code') {
			errorMessage = 'Only response_type=code is supported';
			app = null;
			return;
		}

		loading = true;
		errorMessage = null;
		try {
			// Attempt to load organizations for workspace picker (requires auth).
			await workspaceSettingsPresenter.load({ includeTeam: false });

			const qs = new URLSearchParams({ client_id: clientId });
			if (oauthState) qs.set('state', oauthState);
			const { ok, data } = await httpGateway.get<AuthorizeGetResponse>(`/api/v1/oauth/authorize?${qs.toString()}`);
			if (!ok || !data?.app?.clientId) {
				errorMessage = 'Invalid authorization request.';
				app = null;
				return;
			}
			app = data.app;
		} catch (err) {
			// If user is not signed in, send them to sign-in and come back.
			if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
				void goto(signInHrefWithReturnTo());
				return;
			}
			errorMessage = err instanceof Error ? err.message : 'Failed to load authorization request.';
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
		if (!organizationId) {
			errorMessage = 'Select a workspace first.';
			return;
		}
		submitLoading = true;
		errorMessage = null;
		try {
			const { ok, data } = await httpGateway.request<{ redirect: string }>({
				method: HttpMethod.POST,
				url: '/api/v1/oauth/authorize',
				data: { client_id: clientId, organizationId, state: oauthState || undefined, action },
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
		void loadAuthorizeApp();
	});
</script>

<svelte:head>
	<title>Authorize Application - OpenQuok</title>
</svelte:head>

<div class="mx-auto max-w-xl py-10">
	<div class="rounded-lg border border-base-300 bg-base-100 p-6">
		<img src={url('/icon.svg')} alt="" width="48" height="48" class="mb-4 h-12 w-12" />
		<h1 class="text-lg font-semibold text-base-content">Authorize application</h1>

		{#if !clientId}
			<p class="mt-2 text-sm text-base-content/70">
				Missing <span class="font-mono">client_id</span>. This link is not a valid OAuth authorization request.
			</p>
			<p class="mt-4">
				<a class="link link-primary" href={accountHref}>Back to account</a>
			</p>
		{:else if loading}
			<p class="mt-2 text-sm text-base-content/70">Loading authorization request…</p>
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

			<div class="mt-5">
				<label class="text-sm font-medium text-base-content" for="oauth-org">Workspace</label>
				<select
					id="oauth-org"
					class="select select-bordered mt-2 w-full bg-base-100"
					bind:value={organizationId}
				>
					<option value="" disabled>Select a workspace…</option>
					{#each settingsRepository.organizationsPm as o (o.id)}
						<option value={o.id} disabled={o.disabled}>
							{o.name}{o.disabled ? ' (disabled)' : ''}
						</option>
					{/each}
				</select>
				<p class="mt-2 text-xs text-base-content/60">
					You can revoke app access later in <span class="font-medium">Account → Settings → Approved Apps</span>.
				</p>
			</div>

			<div class="mt-6 flex flex-wrap gap-2">
				<Button variant="primary" disabled={submitLoading} onclick={() => submit('approve')}>
					Authorize
				</Button>
				<Button variant="outline" disabled={submitLoading} onclick={() => submit('deny')}>
					Deny
				</Button>
			</div>
		{:else}
			<p class="mt-2 text-sm text-base-content/70">Invalid authorization request.</p>
			<p class="mt-4"><a class="link link-primary" href={accountHref}>Back to account</a></p>
		{/if}
	</div>
</div>

