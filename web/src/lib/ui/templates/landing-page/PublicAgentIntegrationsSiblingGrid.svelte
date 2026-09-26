<script lang="ts">
	import type { PublicChannelAgentIntegrationGridItem } from '$lib/content/utils/listPublicAgentIntegrationsForChannel';

	import { page } from '$app/state';
	import {
		buildPublicAgentIntegrationsGridCoreLabel,
		buildPublicAgentIntegrationsGridDescription,
		buildPublicAgentIntegrationsGridExtensionLabel,
		buildPublicAgentIntegrationsGridSubtitle,
		buildPublicAgentIntegrationsGridTitle
	} from '$lib/content/utils/buildPublicAgentIntegrationsGridCopy';
	import { listPublicAgentIntegrationsForAgentPage } from '$lib/content/utils/listPublicAgentIntegrationsForAgentPage';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { url } from '$lib/utils/path';

	import FeatureSimpleCard from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import type { FeatureSimpleCardItem } from '$lib/ui/templates/feature-grid/FeatureSimpleCard.svelte';
	import SimpleCardGrid from '$lib/ui/templates/feature-grid/SimpleCardGrid.svelte';

	type Props = {
		agentLabel: string;
		activeAgentSlug: string;
		channelSlug?: string | null;
	};

	let { agentLabel, activeAgentSlug, channelSlug = null }: Props = $props();

	const headingId = 'public-agent-integrations-sibling-grid-heading';

	const integrations = $derived(listPublicAgentIntegrationsForAgentPage(channelSlug));
	const agentHostItems = $derived(integrations.agentHosts);
	const mcpClientItems = $derived(integrations.mcpClients);

	const sectionTitle = $derived(buildPublicAgentIntegrationsGridTitle(agentLabel));
	const sectionDescription = $derived(buildPublicAgentIntegrationsGridDescription(agentLabel));
	const sectionSubtitle = buildPublicAgentIntegrationsGridSubtitle();
	const coreLabel = buildPublicAgentIntegrationsGridCoreLabel();
	const extensionLabel = buildPublicAgentIntegrationsGridExtensionLabel();

	const normalizedActiveSlug = $derived(activeAgentSlug.trim().toLowerCase());

	const showSection = $derived(agentHostItems.length > 0 || mcpClientItems.length > 0);

	function toFeatureCardItem(
		item: PublicChannelAgentIntegrationGridItem
	): FeatureSimpleCardItem & { href: string; kind: PublicChannelAgentIntegrationGridItem['kind'] } {
		return {
			id: item.slug,
			title: item.title,
			description: item.description,
			icon: item.icon,
			href: url(hostedMarketingHref(item.href, page.url.origin)),
			kind: item.kind
		};
	}

	const coreCardItems = $derived(agentHostItems.map(toFeatureCardItem));
	const extensionCardItems = $derived(mcpClientItems.map(toFeatureCardItem));
</script>

{#if showSection}
	<SimpleCardGrid
		heroTheme={landingHeroTheme}
		{headingId}
		title={sectionTitle}
		description={sectionDescription}
		subtitle={sectionSubtitle}
		{coreLabel}
		{extensionLabel}
		items={coreCardItems}
		extensionItems={extensionCardItems}
		getItemKey={(item) => item.id}
		sectionClass="bg-base-200 py-16 sm:py-20"
	>
		{#snippet card(item, context)}
			<FeatureSimpleCard
				item={{
					id: item.id,
					title: item.title,
					description: item.description,
					icon: item.icon
				}}
				href={item.href}
				isActive={item.id === normalizedActiveSlug}
				pattern={context.pattern}
				patternComponent={context.patternComponent}
				patternClass={context.patternClass}
				backgroundVariant={item.kind === 'mcp-client' ? 'striped' : 'hexagon'}
				stripedTone={context.index % 2 === 0 ? 'emerald' : 'amber'}
				stripedDirection={context.index % 2 === 0 ? 'left' : 'right'}
				compact={item.kind === 'mcp-client'}
			/>
		{/snippet}
	</SimpleCardGrid>
{/if}
