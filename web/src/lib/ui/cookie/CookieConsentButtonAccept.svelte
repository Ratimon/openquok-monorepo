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
		buttonText = 'Accept',
		variant = 'secondary',
		class: className = ''
	}: Props = $props();

	function handleAccept() {
		cookieConsentStore.setCookieConsent(true);
	}
</script>

<Button
	variant={variant}
	onclick={handleAccept}
	class={cn(className)}
>
	{buttonText}
</Button>

