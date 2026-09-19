<script lang="ts">
	import { page } from '$app/state';

	import {
		getRootPathPublicAgent,
		getRootPathPublicAgents
	} from '$lib/area-public/constants/getRootPathPublicAgents';
	import {
		PUBLIC_AGENTS_HUB_SECTION_IDS,
		PUBLIC_LANDING_BREADCRUMB
	} from '$lib/content/constants/publicLandingBreadcrumbConfig';
	import PublicLandingHubBreadcrumb, {
		type PublicLandingHubBreadcrumbItem
	} from '$lib/ui/templates/landing-page/PublicLandingHubBreadcrumb.svelte';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route } from '$lib/utils/path';

	type Variant = 'hub' | 'agent-host' | 'mcp-client';

	type Props = {
		variant: Variant;
		agentSlug?: string;
		agentLabel?: string;
		channelLabel?: string | null;
		class?: string;
	};

	let {
		variant,
		agentSlug = '',
		agentLabel = '',
		channelLabel = null,
		class: className = ''
	}: Props = $props();

	const homeHref = $derived(hostedMarketingHref('/', page.url.origin));

	const integrationHubSectionId = $derived(
		variant === 'mcp-client'
			? PUBLIC_AGENTS_HUB_SECTION_IDS.mcpIntegrations
			: PUBLIC_AGENTS_HUB_SECTION_IDS.autonomousAgentIntegrations
	);

	const integrationHubHref = $derived(
		hostedMarketingHref(
			`${route(getRootPathPublicAgents())}#${integrationHubSectionId}`,
			page.url.origin
		)
	);

	const integrationHubLabel = $derived(
		variant === 'mcp-client'
			? PUBLIC_LANDING_BREADCRUMB.mcpIntegrations
			: PUBLIC_LANDING_BREADCRUMB.autonomousAgentIntegrations
	);

	const agentHref = $derived(
		agentSlug.trim()
			? hostedMarketingHref(route(getRootPathPublicAgent(agentSlug.trim())), page.url.origin)
			: null
	);

	const items = $derived.by((): PublicLandingHubBreadcrumbItem[] => {
		if (variant === 'hub') {
			return [
				{ label: 'Home', href: homeHref },
				{ label: PUBLIC_LANDING_BREADCRUMB.agentsHub }
			];
		}

		const trail: PublicLandingHubBreadcrumbItem[] = [
			{ label: 'Home', href: homeHref },
			{ label: integrationHubLabel, href: integrationHubHref }
		];

		const trimmedAgentLabel = agentLabel.trim();
		const trimmedChannelLabel = channelLabel?.trim() ?? '';

		if (trimmedChannelLabel) {
			if (trimmedAgentLabel) {
				trail.push({
					label: trimmedAgentLabel,
					href: agentHref
				});
			}
			trail.push({ label: trimmedChannelLabel });
			return trail;
		}

		if (trimmedAgentLabel) {
			trail.push({ label: trimmedAgentLabel });
		}

		return trail;
	});
</script>

<PublicLandingHubBreadcrumb {items} class={className} />
