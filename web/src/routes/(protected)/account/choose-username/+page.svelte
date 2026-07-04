<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import ClaimUsernameForm from '$lib/ui/components/user/ClaimUsernameForm.svelte';
	import { getProfilePresenter } from '$lib/account';
	import { hasPublicUsername } from '$lib/account/utils/hasPublicUsername';
	import { suggestUsernameFromEmail } from '$lib/account/utils/suggestUsernameFromEmail';
	import { getRootPathAccount } from '$lib/area-protected/getRootPathProtectedArea';
	import { authenticationRepository } from '$lib/user-auth';
	import { url } from '$lib/utils/path';
	import { onMount } from 'svelte';
	import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/ui/card';

	const accountPath = url(getRootPathAccount());
	const redirectTarget = $derived(
		typeof window !== 'undefined'
			? new URLSearchParams(window.location.search).get('redirectURL') ?? accountPath
			: accountPath
	);

	let suggestedUsername = $state('');
	let loading = $state(true);
	let alreadyHasUsername = $state(false);

	onMount(async () => {
		if (!browser) return;
		try {
			await authenticationRepository.checkAuth(undefined, { forceProfile: true });
			const profile = await getProfilePresenter.loadProfileVm();
			if (hasPublicUsername(profile?.username)) {
				alreadyHasUsername = true;
				await goto(redirectTarget, { replaceState: true });
				return;
			}
			const email = profile?.email ?? authenticationRepository.currentUser?.email ?? '';
			suggestedUsername = suggestUsernameFromEmail(email);
		} finally {
			loading = false;
		}
	});

	async function handleSuccess(username: string): Promise<void> {
		authenticationRepository.updateStoredProfile({ username });
		try {
			await authenticationRepository.checkAuth(undefined, { forceProfile: true });
		} catch {
			// Profile was saved; navigation can still proceed
		}
		await goto(redirectTarget, { replaceState: true });
	}
</script>

<div class="mt-12 flex justify-center p-4">
	<Card class="w-full max-w-lg">
		<CardHeader>
			<CardTitle>
				<h1 class="text-2xl font-bold tracking-tight">Choose your username</h1>
			</CardTitle>
			<CardDescription>
				Building blocks and playbooks you publish appear under
				<span class="font-mono text-primary">/creators/your-username/</span>. You need a username
				before publishing to the catalog.
			</CardDescription>
		</CardHeader>
		<CardFooter class="flex-col items-stretch gap-0 border-0 pt-0">
			{#if loading}
				<div class="flex justify-center py-8">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			{:else if !alreadyHasUsername}
				{#key suggestedUsername}
					<ClaimUsernameForm {suggestedUsername} submitLabel="Continue" onSuccess={handleSuccess} />
				{/key}
			{/if}
		</CardFooter>
	</Card>
</div>
