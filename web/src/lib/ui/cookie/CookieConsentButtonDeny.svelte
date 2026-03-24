<script lang="ts">
	import { cookieConsentStore } from '$lib/core/cookieConsent.store';
    import { cn } from '$lib/ui/helpers/common';

	import Button, { type ButtonVariant } from '$lib/ui/buttons/Button.svelte';

	type Props = {
		buttonText?: string;
		variant?: ButtonVariant;
		class?: string;
	};

	let {
		buttonText = 'Deny',
		variant = 'secondary',
		class: className = ''
	}: Props = $props();

	function handleDeny() {
		cookieConsentStore.setCookieConsent(false);
	}
</script>

<Button
	variant={variant}
	onclick={handleDeny}
	class={cn(className)}
>
	{buttonText}
</Button>

