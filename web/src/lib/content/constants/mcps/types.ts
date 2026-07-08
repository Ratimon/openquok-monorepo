import type { IconName } from '$data/icons';

import type {
	FeaturesOrderedStep,
	PublicAgentComparisonSection,
	PublicAgentFeatureSection,
	PublicAgentListingsPreviewSection,
	PublicLandingWorkflowSection
} from '$lib/content/constants/agents/types';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { McpClient } from '$lib/developers/utils/getMcpClientConfig';

export type PublicMcpIntegrationTab = 'mcp' | 'skill';

export type PublicMcpIntegrationViewModel = {
	slug: string;
	label: string;
	mcpClient: McpClient;
	icon: IconName;
	/** Hub card blurb; aligned with mcp-setup-guides index LinkCard descriptions. */
	hubDescription: string;
};

export type PublicMcpLandingPageViewModel = {
	pageType: 'mcp-client';
	slug: string;
	agentId: string;
	agentLabel: string;
	mcpClient: McpClient;
	icon: IconName;
	/** Optional second hero icon (e.g. platform icon on `/agents/{mcp}/{channel}`). */
	heroSecondaryIcon?: IconName;
	available: boolean;
	metaTitle: string;
	metaDescription: string;
	hubDescription: string;
	keywords: string[];
	heroTitle: string;
	heroDescription: string;
	docsPath: string;
	workflowSection: PublicLandingWorkflowSection;
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: AudienceCard[];
	setupStepsSubtitle: string;
	setupStepsTitle: string;
	setupSteps: FeaturesOrderedStep[];
	skillSetupStepsSubtitle: string;
	skillSetupStepsTitle: string;
	skillSetupSteps: FeaturesOrderedStep[];
	featureSections: PublicAgentFeatureSection[];
	listingsPreviewSection: PublicAgentListingsPreviewSection;
	comparisonSection?: PublicAgentComparisonSection;
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

export type McpLandingSeed = PublicMcpIntegrationViewModel & {
	heroDescription: string;
	metaDescription: string;
	/** Where users spend time with this client (e.g. "your editor", "the CLI and your IDE"). */
	workflowPhrase: string;
	/** Plain-text steps: install client, generate token, add MCP config, verify. */
	setupSteps: readonly [string, string, string, string];
};
