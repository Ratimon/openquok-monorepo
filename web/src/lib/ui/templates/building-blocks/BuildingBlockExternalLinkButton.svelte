<script lang="ts">
	import { buttonVariants } from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';

	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import { resolveExternalLinkPolicy } from '$lib/utils/externalLinkRel';

	type Props = {
		href: string;
		label?: string;
		size?: 'default' | 'sm' | 'lg';
		class?: string;
		onClick?: () => void | Promise<void>;
	};

	let { href, label = 'Get started', size = 'sm', class: className = '', onClick }: Props = $props();

	const policy = $derived(resolveExternalLinkPolicy(href));
</script>

<ExternalLink
	{href}
	trusted={policy.trusted}
	follow={policy.follow}
	class={cn(buttonVariants({ variant: 'primary', size }), className)}
	onclick={() => void onClick?.()}
>
	{label}
</ExternalLink>
