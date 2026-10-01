import type { IconName } from '$data/icons';

import type {
	FeaturesOrderedStep,
	PublicAgentComparisonSection,
	PublicAgentFeatureSection,
	PublicAgentListingsPreviewSection,
	PublicLandingWorkflowSection
} from '$lib/content/constants/agents/types';
import type { PublicFaqItem } from '$lib/content/constants/faq';
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

/** Sparse FAQ deltas on top of `buildMcpFaqItems` in `mcps/general.ts`. */
export type McpLandingSeedFaqOverrides = {
	/** Replaces the entire tailored FAQ list. Prefer patches and insertions when possible. */
	faqItems?: PublicFaqItem[];
	/** Merged into default items by exact `title` match. */
	faqPatchesByTitle?: Readonly<
		Record<string, Partial<Pick<PublicFaqItem, 'title' | 'description'>>>
	>;
	/** Inserted immediately after the first default FAQ (before prepend). */
	faqItemsAfterFirst?: readonly PublicFaqItem[];
	/** Placed before the default FAQ block (after patches and after-first insertions). */
	faqItemsPrepend?: readonly PublicFaqItem[];
	/** Inserted immediately before the first item whose `title` equals `matchTitle`. */
	faqItemsBeforeTitle?: {
		matchTitle: string;
		items: readonly PublicFaqItem[];
	};
};

export type McpLandingSeedOverrides = McpLandingSeedFaqOverrides & {
	audienceCards?: AudienceCard[];
	/** Replaces the first entry in the default MCP feature section list. */
	firstFeatureSection?: PublicAgentFeatureSection;
};

export type McpLandingSeed = PublicMcpIntegrationViewModel & {
	heroDescription: string;
	metaDescription: string;
	/** Where users spend time with this client (e.g. "your editor", "the CLI and your IDE"). */
	workflowPhrase: string;
	/** Plain-text steps: install client, generate token, add MCP config, verify. */
	setupSteps: readonly [string, string, string, string];
	/** Optional copy overrides when a client needs distinct positioning (e.g. terminal-first Warp). */
	overrides?: McpLandingSeedOverrides;
};
