<script lang="ts">
	import type { SimpleLinkCardItem } from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';
	import type { PublicAgentChannelHubLinkViewModel } from '$lib/content/constants/publicAgentChannelConfig';

	import { url } from '$lib/utils/path';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	import StripedPattern from '$lib/ui/patterns/StripedPattern.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';
	import SimpleLinkCard from '$lib/ui/templates/feature-grid/SimpleLinkCard.svelte';

	type Props = {
		agentLabel: string;
		channelLinksVm: PublicAgentChannelHubLinkViewModel[];
		/** When set, that channel is omitted — hub shows other platforms only. */
		activeChannelSlug?: string | null;
	};

	let { agentLabel, channelLinksVm, activeChannelSlug = null }: Props = $props();

	const headingId = 'agent-channel-hub-heading';

	let channelCardItems = $derived(
		channelLinksVm
			.filter((channel) => !activeChannelSlug?.trim() || channel.slug !== activeChannelSlug)
			.map(
				(channel): SimpleLinkCardItem => ({
					id: channel.slug,
					title: channel.platformLabel,
					iconName: channel.icon,
					href: url(channel.href),
					description: channel.description,
					ctaLabel: 'Open'
				})
			)
	);

	let sectionTitle = $derived(
		activeChannelSlug?.trim() ? `More channels for ${agentLabel}` : `${agentLabel} by channel`
	);
</script>

{#if channelCardItems.length > 0}
	<SimpleCardGrid
		heroTheme={landingHeroTheme}
		{headingId}
		subtitle="By channel"
		title={sectionTitle}
		description="Choose a channel for platform-specific workflows, examples, and FAQs."
		items={channelCardItems}
		getItemKey={(item) => item.id}
		sectionClass="pt-16 pb-0 sm:pt-20"
		patternComponent={StripedPattern}
		patternClass="text-primary/12 stroke-[0.75]"
	>
		{#snippet card(item, context)}
			<SimpleLinkCard
				{item}
				pattern={context.pattern}
				patternComponent={context.patternComponent}
				patternClass={context.patternClass}
			/>
		{/snippet}
	</SimpleCardGrid>
{/if}
