<script lang="ts">
	import { icons } from '$data/icons';

	import { getSocialProfileHref } from '$lib/config/constants/config';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();

	const discordHref = getSocialProfileHref('SOCIAL_LINKS_DISCORD');
</script>

{#if discordHref}
	<ExternalLink
		href={discordHref}
		ariaLabel="Join Discord Support"
		trusted
		class={cn(
			'fixed bottom-20 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-content shadow-lg transition hover:bg-primary/90 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
			className
		)}
	>
		<AbstractIcon name={icons.Discord.name} width="20" height="20" aria-hidden="true" />
		<span>Discord Support</span>
	</ExternalLink>
{/if}
