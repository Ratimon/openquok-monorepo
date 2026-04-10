<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { workspaceSettingsPresenter } from '$lib/settings/index';
	import { WorkspaceSettingsStatus } from '$lib/settings/WorkspaceSettings.presenter.svelte';
	import { authenticationRepository } from '$lib/user-auth/index';
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { absoluteUrl } from '$lib/utils/path';
	import Button from '$lib/ui/buttons/Button.svelte';

	const signinUrl = absoluteUrl(`/${getRootPathSignin()}`);
	const signinUrlWithRedirect = $derived(
		`${signinUrl}?redirectURL=${encodeURIComponent(page.url.pathname + page.url.search)}`
	);
	const accountUrl = absoluteUrl(`/${getRootPathAccount()}`);

	const isAuthenticated = $derived(authenticationRepository.isAuthenticated());

	const loading = $derived(workspaceSettingsPresenter.status === WorkspaceSettingsStatus.VALIDATING_INVITE);
	const joining = $derived(workspaceSettingsPresenter.status === WorkspaceSettingsStatus.JOINING_BY_TOKEN);

	const validateInviteError = $derived(workspaceSettingsPresenter.validateInviteError);
	const inviteOrganizationName = $derived(workspaceSettingsPresenter.inviteOrganizationName);
	const inviteRole = $derived(workspaceSettingsPresenter.inviteRole);
	const joinByTokenError = $derived(workspaceSettingsPresenter.joinByTokenError);

	let token = $state('');

	onMount(() => {
		const urlToken = page.url.searchParams.get('token') ?? '';
		token = urlToken;
		workspaceSettingsPresenter.validateInviteToken(urlToken);
	});

	async function acceptInvite() {
		if (!token || joining) return;
		const result = await workspaceSettingsPresenter.joinByToken(token);
		if (result.success) {
			await goto(accountUrl, { replaceState: true });
		}
	}
</script>

<main class="min-h-screen bg-base-200 flex items-center justify-center px-4">
	<div class="w-full max-w-lg rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm">
		<h1 class="text-2xl font-semibold text-base-content">
			Join workspace</h1>

		{#if loading}
			<p class="mt-4 text-sm text-base-content/80">
				Validating your invite…</p>
		{:else if validateInviteError}
			<p class="mt-4 text-sm text-error">
				{validateInviteError}</p>
			<p class="mt-4 text-sm text-base-content/70">
				You can return to your account or sign in again and try opening the link once more.
			</p>
			<div class="mt-6 flex flex-wrap gap-3">
				<Button
					href={accountUrl}
					size="sm"
					variant="ghost"
					class="border-0 bg-base-content text-base-100 hover:bg-base-content/90"
				>
					Go to account
				</Button>
				<Button href={signinUrl} variant="ghost" size="sm" class="border border-base-300 text-base-content">
					Sign in
				</Button>
			</div>
		{:else}
			<p class="mt-3 text-sm text-base-content/80">
				You've been invited to join
				<span class="font-semibold">{inviteOrganizationName}</span>
				as
				<span class="font-semibold">{inviteRole}</span>.
			</p>
			<p class="mt-2 text-sm text-base-content/70">
				Accepting this invite will add you to this workspace.
			</p>

			{#if joinByTokenError}
				<p class="mt-4 text-sm text-error">
					{joinByTokenError}</p>
			{/if}

			<div class="mt-6 flex flex-wrap gap-3">
				{#if !isAuthenticated}
					<Button
						href={signinUrlWithRedirect}
						variant="ghost"
						class="border-0 bg-base-content text-base-100 hover:bg-base-content/90"
					>
						Sign in to accept
					</Button>
					<Button href={accountUrl} variant="ghost" class="border border-base-300 text-base-content">
						Go to account
					</Button>
				{:else}
					<Button
						type="button"
						variant="ghost"
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
					<Button href={accountUrl} variant="ghost" class="border border-base-300 text-base-content">
						Cancel
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</main>
