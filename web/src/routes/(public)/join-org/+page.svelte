<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { workspaceSettingsPresenter } from '$lib/settings/index';
	import { WorkspaceSettingsStatus } from '$lib/settings/WorkspaceSettings.presenter.svelte';
	import { AuthStatus } from '$lib/user-auth/AuthStatus.model.svelte';
	import { signoutPresenter } from '$lib/user-auth/index';
	import {
		getRootPathSignin,
		getRootPathSignup
	} from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { absoluteUrl, route, url } from '$lib/utils/path';
	import Button from '$lib/ui/buttons/Button.svelte';

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInPath = route(rootPathSignIn);
	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);
	// /account
	const rootPathAccount = getRootPathAccount();
	const accountPath = route(rootPathAccount);
	const accountUrl = absoluteUrl(accountPath);

	const isAuthenticated = $derived(
		page.data?.authStatus === AuthStatus.AUTHENTICATED || page.data?.authStatus === 'authenticated'
	);

	const authChecking = $derived(
		page.data?.authStatus === AuthStatus.UNKNOWN ||
			page.data?.authStatus === AuthStatus.CHECKING ||
			page.data?.authStatus === 'unknown' ||
			page.data?.authStatus === 'checking'
	);

	const currentUserEmail = $derived(
		(page.data as App.LayoutData | undefined)?.currentUser?.email?.trim().toLowerCase() ?? ''
	);

	const validatingInvite = $derived(
		workspaceSettingsPresenter.status === WorkspaceSettingsStatus.VALIDATING_INVITE
	);

	const joining = $derived(workspaceSettingsPresenter.status === WorkspaceSettingsStatus.JOINING_BY_TOKEN);

	const validateInviteError = $derived(workspaceSettingsPresenter.validateInviteError);
	const inviteOrganizationName = $derived(workspaceSettingsPresenter.inviteOrganizationName);
	const inviteRole = $derived(workspaceSettingsPresenter.inviteRole);
	const inviteeEmail = $derived(workspaceSettingsPresenter.inviteeEmail.trim().toLowerCase());
	const joinByTokenError = $derived(workspaceSettingsPresenter.joinByTokenError);

	const inviteReady = $derived(Boolean(inviteOrganizationName) && !validateInviteError);

	let token = $state('');
	let switchingAccount = $state(false);

	const signedInAsWrongAccount = $derived(
		isAuthenticated &&
			Boolean(inviteeEmail) &&
			Boolean(currentUserEmail) &&
			inviteeEmail !== currentUserEmail
	);

	const isPreparing = $derived(
		authChecking ||
			validatingInvite ||
			(!validateInviteError && !inviteReady && Boolean(token))
	);

	/** Must use `redirectURL` — `getPostSigninRedirectTarget` does not read `returnTo`. */
	function authHrefWithReturnTo(path: string): string {
		const target = page.url.pathname + (page.url.search || '');
		return `${path}?redirectURL=${encodeURIComponent(target)}`;
	}

	const signInHrefWithReturnTo = $derived(absoluteUrl(authHrefWithReturnTo(signInPath)));
	const signUpHrefWithReturnTo = $derived(absoluteUrl(authHrefWithReturnTo(signUpPath)));

	function validateTokenFromUrl(): void {
		const urlToken = page.url.searchParams.get('token')?.trim() ?? '';
		token = urlToken;
		workspaceSettingsPresenter.clearInviteTokenState();
		if (!urlToken) {
			workspaceSettingsPresenter.setInviteValidateError(
				workspaceSettingsPresenter.inviteValidateErrorMessage('malformed')
			);
			return;
		}
		void workspaceSettingsPresenter.validateInviteToken(urlToken);
	}

	onMount(() => {
		validateTokenFromUrl();
	});

	async function signOutAndUseInvitedAccount(): Promise<void> {
		if (switchingAccount) return;
		switchingAccount = true;
		try {
			await signoutPresenter.signout();
			await invalidateAll();
			void goto(signInHrefWithReturnTo);
		} finally {
			switchingAccount = false;
		}
	}

	async function acceptInvite() {
		if (!token || joining || signedInAsWrongAccount) return;
		if (!isAuthenticated) {
			void goto(signInHrefWithReturnTo);
			return;
		}
		const result = await workspaceSettingsPresenter.joinByToken(token);
		if (result.success) {
			await goto(accountUrl, { replaceState: true });
		}
	}
</script>

<main class="min-h-screen bg-base-200 flex items-center justify-center px-4">
	<div class="w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
		<img src={url('/icon.svg')} alt="" width="48" height="48" class="mb-4 h-12 w-12" />
		<h1 class="text-2xl font-semibold text-base-content">
			Join workspace
		</h1>

		{#if isPreparing}
			<div
				class="mt-5 flex flex-col items-center gap-3 py-4 text-center"
				role="status"
				aria-live="polite"
				aria-busy="true"
			>
				<span class="loading loading-spinner loading-md text-primary" aria-hidden="true"></span>
				<p class="text-sm text-base-content/70">
					{#if authChecking}
						Checking your session…
					{:else}
						Validating your invitation…
					{/if}
				</p>
			</div>
		{:else if validateInviteError}
			<p class="mt-4 text-sm text-error">{validateInviteError}</p>
			<p class="mt-4 text-sm text-base-content/70">
				You can sign in or create an account and open this link again. If the problem continues, ask the
				workspace owner to send a new invitation from team settings.
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<Button href={signInHrefWithReturnTo} variant="primary" size="sm">Sign in</Button>
				<Button
					href={signUpHrefWithReturnTo}
					variant="ghost"
					size="sm"
					class="border border-base-300 text-base-content"
				>
					Create account
				</Button>
			</div>
		{:else if inviteReady}
			<p class="mt-3 text-sm text-base-content/80">
				You've been invited to join
				<span class="font-semibold">{inviteOrganizationName}</span>
				as
				<span class="font-semibold">{inviteRole}</span>.
			</p>

			{#if inviteeEmail}
				<p class="mt-2 text-sm text-base-content/70">
					This invitation was sent to
					<span class="font-medium text-base-content">{workspaceSettingsPresenter.inviteeEmail}</span>.
				</p>
			{/if}

			{#if !isAuthenticated}
				<p class="mt-5 text-sm text-base-content/70">
					Sign in or create an account with that email address, then accept the invitation.
				</p>
				<div class="mt-5 flex flex-wrap gap-3">
					<Button href={signInHrefWithReturnTo} variant="primary" size="sm">Sign in</Button>
					<Button
						href={signUpHrefWithReturnTo}
						variant="ghost"
						size="sm"
						class="border border-base-300 text-base-content"
					>
						Create account
					</Button>
				</div>
			{:else if signedInAsWrongAccount}
				<p class="mt-5 text-sm text-base-content/70">
					You are signed in as
					<span class="font-medium text-base-content"
						>{(page.data as App.LayoutData | undefined)?.currentUser?.email}</span
					>. Sign in with the invited account to accept this invitation.
				</p>
				<div class="mt-5 flex flex-wrap gap-3">
					<Button
						type="button"
						variant="primary"
						size="sm"
						disabled={switchingAccount}
						onclick={signOutAndUseInvitedAccount}
					>
						{#if switchingAccount}
							Signing out…
						{:else}
							Sign in as invited user
						{/if}
					</Button>
					<Button href={accountUrl} variant="ghost" size="sm" class="border border-base-300 text-base-content">
						Go to account
					</Button>
				</div>
			{:else}
				<p class="mt-2 text-sm text-base-content/70">
					Accepting this invite will add you to this workspace.
				</p>

				{#if joinByTokenError}
					<p class="mt-4 text-sm text-error">{joinByTokenError}</p>
				{/if}

				<div class="mt-6 flex flex-wrap gap-3">
					<Button
						type="button"
						variant="primary"
						size="sm"
						class="border-0 bg-base-content text-base-100 hover:bg-base-content/90"
						onclick={acceptInvite}
						disabled={joining}
					>
						{#if joining}
							Joining…
						{:else}
							Accept invite
						{/if}
					</Button>
					<Button href={accountUrl} variant="ghost" size="sm" class="border border-base-300 text-base-content">
						Cancel
					</Button>
				</div>
			{/if}
		{/if}
	</div>
</main>
