<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resetPasswordPresenter } from '$lib/user-auth/index';
	import { ResetPasswordStatus } from '$lib/user-auth/ResetPassword.presenter.svelte';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/ui/card';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { icons } from '$data/icon';

	let token = $state('');
	let email = $state('');
	let recoveryType = $state('');
	let verifying = $state(false);
	let errorMessage = $state<string | null>(null);

	onMount(async () => {
		if (typeof window === 'undefined') return;
		const params = new URLSearchParams(window.location.search);
		token = params.get('token') ?? '';
		email = params.get('email') ?? '';
		recoveryType = params.get('type') ?? '';
		if (!token || !email || recoveryType !== 'recovery') {
			goto('/auth-error?message=' + encodeURIComponent('Invalid or missing link. Please request a new change-password email from Settings.'), { replaceState: true });
			return;
		}
		verifying = true;
		errorMessage = null;
		try {
			await resetPasswordPresenter.verifyReset(email, token, 'recovery');
			if (resetPasswordPresenter.status === ResetPasswordStatus.CODE_VERIFICATION_SUCCESS) {
				goto('/account/settings/password', { replaceState: true });
			} else {
				errorMessage = resetPasswordPresenter.toastMessage || 'Verification failed. The link may have expired.';
			}
		} catch (err) {
			console.error('Confirm change password error:', err);
			errorMessage = 'This link is invalid or has expired. Please request a new change-password email from Account Settings.';
		} finally {
			verifying = false;
		}
	});
</script>

<svelte:head>
	<title>
		Confirm change password</title>
</svelte:head>

<div class="mt-12 flex justify-center px-4">
	<Card class="w-full max-w-md border-base-300 bg-base-100">
		<CardHeader>
			<CardTitle class="text-base-content">
				{#if verifying}
					Verifying your link…
				{:else if errorMessage}
					Link invalid or expired
				{:else}
					Confirm change password
				{/if}
			</CardTitle>
			<CardDescription class="text-base-content/70">
				{#if verifying}
					Please wait while we verify your link.
				{:else if errorMessage}
					{errorMessage}
				{:else}
					Redirecting you to change your password…
				{/if}
			</CardDescription>
		</CardHeader>
		{#if errorMessage}
			<CardFooter>
				<Button href="/account/settings" variant="outline">
					Back to Settings
				</Button>
			</CardFooter>
		{:else if verifying}
			<CardFooter>
				<span class="flex items-center gap-2 text-base-content/70">
					<AbstractIcon name={icons.LoaderCircle.name} width="24" height="24" class="animate-spin" />
					Verifying…
				</span>
			</CardFooter>
		{/if}
	</Card>
</div>
