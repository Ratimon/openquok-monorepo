import type { IconName } from '$data/icons';

import type { MessagingGatewayArchetypeParams } from '$lib/content/constants/agents/archetypes/messaging-gateway';

import type { PublicChannelFeatureBentoId } from '$lib/content/constants/channels/catalog/feature-bento';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import type { DesktopMockContentId } from '$lib/ui/templates/device-mocks/desktop/desktopMock.types';
import type { IphoneMockContentId } from '$lib/ui/templates/device-mocks/iphone-15-pro/iphoneMock.types';
import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
import type { SettingsPanelMockContentId } from '$lib/ui/templates/device-mocks/settings-panel/settingsPanelMock.types';
import type { TerminalMockContentId } from '$lib/ui/templates/device-mocks/terminal/terminalMock.types';
import type { MessagingGatewayAgentFaqParams } from '$lib/content/constants/agents/archetypes/messaging-gateway-faq';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type {
	OpenquokCliCommandReferenceItem,
	SkillInstallOption
} from '$lib/content/constants/agents/cli-command-reference';
import type { ComparisonPoint } from '$lib/ui/templates/WithWithout.svelte';
import type { ComparePoint } from '$lib/ui/templates/Compare.svelte';

export type FeaturesAnimatedContentId = 'llm-models' | 'agent-integrations';

export type FeaturesAnimatedModel = {
	name: string;
	provider: string;
	description: string;
	iconName: IconName;
	iconClass?: string;
	containerClass?: string;
};

export type FeaturesOrderedDeviceMock =
	| 'safari'
	| 'iphone-15-pro'
	| 'terminal'
	| 'settings-panel'
	| 'desktop';

export type FeaturesOrderedStep = {
	id: number;
	title: string;
	content: string;
	mediaSrc?: string;
	mediaAlt?: string;
	animatedContent?: FeaturesAnimatedContentId;
	/** Overrides default carousel models when `animatedContent` is set. */
	animatedModels?: FeaturesAnimatedModel[];
	deviceMock?: FeaturesOrderedDeviceMock;
	deviceMockContent?:
		| SafariMockContentId
		| IphoneMockContentId
		| TerminalMockContentId
		| SettingsPanelMockContentId
		| DesktopMockContentId;
	/** Inline terminal preview when `deviceMock` is `terminal` (overrides `deviceMockContent`). */
	terminalCode?: string;
	mockUrl?: string;
	/** Optional HowToStep `url` in JSON-LD (fragment or absolute). */
	howToStepUrl?: string;
	iconName: IconName;
};

export type PublicAgentSupportedChannelsSection = {
	subtitle?: string;
	title: string;
	description: string;
	extensionLabel: string;
};

export type PublicAgentComparisonSection = {
	subtitle: string;
	title: string;
	description: string;
	withoutTitle: string;
	withTitle: string;
	points: ComparisonPoint[];
};

export type PublicAgentsHubCompareSection = {
	subtitle: string;
	title: string;
	description: string;
	leftTitle: string;
	rightTitle: string;
	points: ComparePoint[];
};

export type PublicAgentsHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

export type PublicAgentCommandReferenceSection = {
	subtitle: string;
	title: string;
	description?: string;
	commands?: readonly OpenquokCliCommandReferenceItem[];
};

export type PublicLandingWorkflowSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling. */
	title: string;
	description: string;
	deviceMock: 'desktop' | 'iphone-15-pro';
	deviceMockContent: DesktopMockContentId | IphoneMockContentId;
	imageAlt?: string;
};

export type PublicAgentParallelMockDevice =
	| 'desktop'
	| 'iphone-15-pro'
	| 'settings-panel'
	| 'terminal';

export type PublicAgentParallelMockItem = {
	deviceMock: PublicAgentParallelMockDevice;
	deviceMockContent?:
		| DesktopMockContentId
		| IphoneMockContentId
		| SettingsPanelMockContentId
		| TerminalMockContentId;
	/** Inline terminal preview when `deviceMock` is `terminal`, or CLI inside a `desktop` frame. */
	terminalCode?: string;
	imageAlt?: string;
};

export type PublicAgentFeatureSection = {
	subtitle: string;
	/** Comma-separated lines; each part gets landing-page gradient styling. */
	title: string;
	description: string;
	/** Optional demo asset under `/landing/` or `/static/`. */
	imageSrc?: string;
	imageAlt?: string;
	/** Interactive bento showcase (takes precedence over `imageSrc`). */
	bentoId?: PublicChannelFeatureBentoId;
	/** Staggered multi-device preview (takes precedence over single `deviceMock`). */
	parallelMocks?: PublicAgentParallelMockItem[];
	/** Multi-line OpenQuok CLI example rendered below the description. */
	cliCommands?: string;
	/** Heading above `cliCommands` (defaults to “CLI command options”). */
	cliCommandsTitle?: string;
	deviceMock?: FeaturesOrderedDeviceMock;
	deviceMockContent?:
		| SafariMockContentId
		| IphoneMockContentId
		| TerminalMockContentId
		| SettingsPanelMockContentId
		| DesktopMockContentId;
	/** When true, media renders on the right; otherwise on the left. */
	mediaOnRight?: boolean;
};

/** Playbooks + building blocks preview grid (static copy; listing cards loaded at runtime). */
export type PublicAgentListingsPreviewSection = {
	headingId: string;
	subtitle: string;
	title: string;
	description: string;
	playbooksGridLabel: string;
	buildingBlocksGridLabel: string;
	playbooksSeeAllDescription: string;
	playbooksSkillBuilderDescription: string;
	buildingBlocksSeeAllDescription: string;
	/** Max listing cards per grid block; see-all card is rendered in addition. */
	itemsPerBlockLimit: number;
};

export type PublicAgentHostLandingPageViewModel = {
	pageType: 'agent-host';
	slug: string;
	/** Catalog identifier used for icons and docs links. */
	agentId: string;
	agentLabel: string;
	/** Telegram device-mock header; defaults to `agentLabel` when omitted. */
	telegramBotLabel?: string;
	icon: IconName;
	/** Optional second hero icon (e.g. platform icon on `/agents/{agent}/{channel}`). */
	heroSecondaryIcon?: IconName;
	/** When false, hub shows a coming-soon badge and detail route 404s. */
	available: boolean;
	metaTitle: string;
	metaDescription: string;
	/** Hub card blurb on `/agents`; falls back to `metaDescription` when omitted. */
	hubDescription?: string;
	keywords: string[];
	heroTitle: string;
	heroDescription: string;
	/** Setup guide under `/docs/`. */
	docsPath: string;
	/** Copy-paste commands for installing openquok-core on this agent host (hero). */
	skillInstallOptions: readonly SkillInstallOption[];
	workflowSection?: PublicLandingWorkflowSection;
	audienceSubtitle: string;
	audienceTitle: string;
	audienceCards: AudienceCard[];
	setupStepsSubtitle: string;
	setupStepsTitle: string;
	setupSteps: FeaturesOrderedStep[];
	featureSections: PublicAgentFeatureSection[];
	listingsPreviewSection: PublicAgentListingsPreviewSection;
	comparisonSection?: PublicAgentComparisonSection;
	commandReferenceSection?: PublicAgentCommandReferenceSection;
	supportedChannelsSection?: PublicAgentSupportedChannelsSection;
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

/** Agent host catalog entries (OpenClaw, Hermes, …). */
export type PublicAgentLandingPageViewModel = PublicAgentHostLandingPageViewModel;

/** Sparse FAQ deltas on agent host landings (same merge order as MCP seeds). */
export type AgentHostLandingSeedFaqOverrides = {
	faqItems?: PublicFaqItem[];
	faqPatchesByTitle?: Readonly<
		Record<string, Partial<Pick<PublicFaqItem, 'title' | 'description'>>>
	>;
	faqItemsAfterFirst?: readonly PublicFaqItem[];
	faqItemsPrepend?: readonly PublicFaqItem[];
	faqItemsBeforeTitle?: {
		matchTitle: string;
		items: readonly PublicFaqItem[];
	};
};

export type AgentHostLandingSeedOverrides = AgentHostLandingSeedFaqOverrides & {
	setupSteps?: FeaturesOrderedStep[];
	featureSections?: PublicAgentFeatureSection[];
	audienceCards?: AudienceCard[];
	/** Replaces the first entry in the default feature section list. */
	firstFeatureSection?: PublicAgentFeatureSection;
};

/**
 * Thin host entry — register in `agents/seeds.ts` and build with `buildAgentHostLandingPage`.
 * Requires a row in `host-profiles.ts` for the slug.
 */
export type AgentHostLandingSeed = Pick<
	PublicAgentHostLandingPageViewModel,
	| 'slug'
	| 'agentId'
	| 'agentLabel'
	| 'icon'
	| 'available'
	| 'metaTitle'
	| 'metaDescription'
	| 'hubDescription'
	| 'keywords'
	| 'heroTitle'
	| 'heroDescription'
	| 'docsPath'
	| 'skillInstallOptions'
	| 'workflowSection'
	| 'audienceSubtitle'
	| 'audienceTitle'
	| 'audienceCards'
	| 'comparisonSection'
	| 'commandReferenceSection'
	| 'supportedChannelsSection'
	| 'faqSubtitle'
	| 'faqTitle'
	| 'faqDescription'
> & {
	telegramBotLabel?: string;
	heroSecondaryIcon?: IconName;
	/** Params for `uiArchetype: 'messaging-gateway'` in `host-profiles.ts`. */
	messagingGateway?: MessagingGatewayArchetypeParams;
	/** Default FAQs for messaging-gateway hosts; merged with `overrides` FAQ deltas. */
	messagingGatewayFaq?: MessagingGatewayAgentFaqParams;
	/** Required when `messagingGatewayFaq` is omitted (non-archetype or custom FAQ list). */
	faqItems?: PublicFaqItem[];
	overrides?: AgentHostLandingSeedOverrides;
};
