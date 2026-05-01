<script lang="ts">
	import { toast } from '$lib/ui/sonner';
	import { getGoogleOAuthStartUrl } from '$lib/user-auth/constants/googleOAuth';
	import { authenticationRepository } from '$lib/user-auth/index';
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		/** Post-login path for the backend OAuth callback (e.g. `/account` or full URL — path is extracted). */
		next?: string | null;
	};

	let { next = null }: Props = $props();

	let isLoading = $state(false);

	function signInWithGoogle() {
		isLoading = true;
		try {
			// If the user just signed out, refresh may be temporarily suppressed.
			// OAuth callback relies on refresh to establish the session in the SPA.
			authenticationRepository.prepareForOAuthRedirect();
			const target = getGoogleOAuthStartUrl({ next });
			window.location.assign(target);
		} catch (err) {
			console.error(err);
			toast.error('Could not start Google sign-in', {
				description: 'Check your connection and API configuration, then try again.'
			});
			isLoading = false;
		}
	}
</script>

<Button
	type="button"
	variant="outline"
	class="h-14 w-full font-bold"
	disabled={isLoading}
	data-testid="sign-in-with-google-button"
	onclick={signInWithGoogle}
>
	{#if isLoading}
		<span class="mr-2 inline-flex animate-spin">
			<AbstractIcon name={icons.LoaderCircle.name} width="18" height="18" focusable="false" />
		</span>
	{:else}
		<span class="mr-2 inline-flex shrink-0">
			<AbstractIcon name={icons.Google.name} width="18" height="18" focusable="false" />
		</span>
	{/if}
	Google
</Button>
