import type { PaidSubscriptionTier } from 'openquok-common';

export type PublicPricingLandingPresetId =
	| 'home'
	| 'api-posting-hub'
	| 'api-scheduling-hub'
	| 'api-posting-platform'
	| 'api-scheduling-platform';

export type PublicPricingLandingSection = {
	subtitle: string;
	title: string;
	description: string;
};

export type PublicPricingLandingContext = {
	platformLabel?: string;
};

export type PublicPricingLandingPlanOverrides = Partial<
	Record<PaidSubscriptionTier, { tabHeadline?: string }>
>;

type PublicPricingLandingPresetDefinition = {
	section: PublicPricingLandingSection;
	planTabHeadlineOverrides?: PublicPricingLandingPlanOverrides;
	/** When set, `{platformLabel}` in section copy and tab headlines is replaced from context. */
	interpolatePlatformLabel?: boolean;
};

/** Git defaults — keep in sync with `CONFIG_SCHEMA_LANDING_PAGE` PRICING_* fields in config.ts. */
const HOME_SECTION: PublicPricingLandingSection = {
	subtitle: 'Pricings',
	title: 'Find your perfect plan',
	description:
		'Transparent pricing for our social media scheduling tool. No hidden fees — cancel anytime. Start with a 7-day free trial.'
};

const API_POSTING_HUB_SECTION: PublicPricingLandingSection = {
	subtitle: 'Pricing',
	title: 'Ship your,posting API,on any plan',
	description:
		'Every paid plan includes Public API access, the Node SDK, MCP tools, and OAuth apps per workspace. Start with a 7-day free trial — no credit card required.'
};

const API_SCHEDULING_HUB_SECTION: PublicPricingLandingSection = {
	subtitle: 'Pricing',
	title: 'Transparent pricing,for your,scheduling API',
	description:
		'Every paid plan includes Public API access, MCP tools, and OAuth apps per workspace. Start with a 7-day free trial — no credit card required.'
};

const API_POSTING_HUB_PLAN_OVERRIDES: PublicPricingLandingPlanOverrides = {
	SOLO: {
		tabHeadline:
			'Wire POST /public/posts from a side project — REST, Node SDK, or MCP in one workspace.'
	},
	TEAM: {
		tabHeadline:
			'OAuth apps per workspace so customers connect channels without your backend holding tokens.'
	},
	ULTIMATE: {
		tabHeadline:
			'Multiple brands and agent workspaces — same API surface, isolated tokens per workspace.'
	},
	MAX: {
		tabHeadline:
			'Extreme API throughput when every connected channel runs on programmatic schedules.'
	}
};

const API_SCHEDULING_HUB_PLAN_OVERRIDES: PublicPricingLandingPlanOverrides = {
	SOLO: {
		tabHeadline: 'Prototype scheduling from curl, SDK, or MCP before you ship to customers.'
	},
	TEAM: {
		tabHeadline:
			'OAuth apps for customer workspaces — queue scheduledAt once, OpenQuok delivers on time.'
	},
	ULTIMATE: {
		tabHeadline:
			'Several brands on one account — isolate workspaces and tokens while keeping one REST API contract.'
	},
	MAX: {
		tabHeadline:
			'High-volume scheduled pipelines across many workspaces without per-seat API limits.'
	}
};

const API_POSTING_PLATFORM_SECTION: PublicPricingLandingSection = {
	subtitle: 'Pricing',
	title: 'Transparent pricing,for {platformLabel},posting API',
	description:
		'Every paid plan includes Public API access, the Node SDK, MCP tools, and OAuth apps per workspace. Publish to {platformLabel} from REST, SDK, or MCP — start with a 7-day free trial, no credit card required.'
};

const API_SCHEDULING_PLATFORM_SECTION: PublicPricingLandingSection = {
	subtitle: 'Pricing',
	title: 'Transparent pricing,for {platformLabel},scheduling API',
	description:
		'Every paid plan includes Public API access, MCP tools, and OAuth apps per workspace. Schedule on {platformLabel} via REST, Node SDK, or MCP — start with a 7-day free trial, no credit card required.'
};

const API_POSTING_PLATFORM_PLAN_OVERRIDES: PublicPricingLandingPlanOverrides = {
	SOLO: {
		tabHeadline:
			'Prototype {platformLabel} posting from curl, SDK, or MCP before you ship to customers.'
	},
	TEAM: {
		tabHeadline:
			'OAuth apps per workspace so customers connect {platformLabel} without your backend holding tokens.'
	},
	ULTIMATE: {
		tabHeadline:
			'Run {platformLabel} alongside other networks — isolated workspaces, one REST API contract.'
	},
	MAX: {
		tabHeadline:
			'High-volume {platformLabel} publishing across many workspaces when throughput is the job.'
	}
};

const API_SCHEDULING_PLATFORM_PLAN_OVERRIDES: PublicPricingLandingPlanOverrides = {
	SOLO: {
		tabHeadline:
			'Prototype {platformLabel} scheduling from curl, SDK, or MCP before you ship to customers.'
	},
	TEAM: {
		tabHeadline:
			'OAuth apps for customer workspaces — queue {platformLabel} posts once, OpenQuok delivers on time.'
	},
	ULTIMATE: {
		tabHeadline:
			'Schedule on {platformLabel} with other brands — isolated tokens per workspace, same API surface.'
	},
	MAX: {
		tabHeadline:
			'High-volume {platformLabel} schedules across many workspaces without per-seat API limits.'
	}
};

const PRESET_DEFINITIONS: Record<PublicPricingLandingPresetId, PublicPricingLandingPresetDefinition> =
	{
		home: {
			section: HOME_SECTION
		},
		'api-posting-hub': {
			section: API_POSTING_HUB_SECTION,
			planTabHeadlineOverrides: API_POSTING_HUB_PLAN_OVERRIDES
		},
		'api-scheduling-hub': {
			section: API_SCHEDULING_HUB_SECTION,
			planTabHeadlineOverrides: API_SCHEDULING_HUB_PLAN_OVERRIDES
		},
		'api-posting-platform': {
			section: API_POSTING_PLATFORM_SECTION,
			planTabHeadlineOverrides: API_POSTING_PLATFORM_PLAN_OVERRIDES,
			interpolatePlatformLabel: true
		},
		'api-scheduling-platform': {
			section: API_SCHEDULING_PLATFORM_SECTION,
			planTabHeadlineOverrides: API_SCHEDULING_PLATFORM_PLAN_OVERRIDES,
			interpolatePlatformLabel: true
		}
	};

const PLATFORM_PRESET_HUB_FALLBACK: Partial<
	Record<PublicPricingLandingPresetId, PublicPricingLandingPresetId>
> = {
	'api-posting-platform': 'api-posting-hub',
	'api-scheduling-platform': 'api-scheduling-hub'
};

function interpolatePlatformLabel(text: string, platformLabel: string): string {
	return text.replaceAll('{platformLabel}', platformLabel);
}

function resolvePlatformLabel(context?: PublicPricingLandingContext): string | undefined {
	const label = context?.platformLabel?.trim();
	return label || undefined;
}

function applyPlatformLabelToSection(
	section: PublicPricingLandingSection,
	platformLabel: string
): PublicPricingLandingSection {
	return {
		subtitle: interpolatePlatformLabel(section.subtitle, platformLabel),
		title: interpolatePlatformLabel(section.title, platformLabel),
		description: interpolatePlatformLabel(section.description, platformLabel)
	};
}

function applyPlatformLabelToPlanOverrides(
	overrides: PublicPricingLandingPlanOverrides | undefined,
	platformLabel: string
): PublicPricingLandingPlanOverrides {
	if (!overrides) {
		return {};
	}

	return Object.fromEntries(
		Object.entries(overrides).map(([tier, override]) => [
			tier,
			override?.tabHeadline
				? {
						tabHeadline: interpolatePlatformLabel(override.tabHeadline, platformLabel)
					}
				: override
		])
	) as PublicPricingLandingPlanOverrides;
}

export function getPublicPricingLandingSection(
	presetId: PublicPricingLandingPresetId,
	context?: PublicPricingLandingContext
): PublicPricingLandingSection {
	const preset = PRESET_DEFINITIONS[presetId];
	const platformLabel = resolvePlatformLabel(context);

	if (preset.interpolatePlatformLabel && platformLabel) {
		return applyPlatformLabelToSection(preset.section, platformLabel);
	}

	const fallbackPresetId = PLATFORM_PRESET_HUB_FALLBACK[presetId];
	if (preset.interpolatePlatformLabel && !platformLabel && fallbackPresetId) {
		return getPublicPricingLandingSection(fallbackPresetId);
	}

	return preset.section;
}

export function getPublicPricingLandingPlanOverrides(
	presetId: PublicPricingLandingPresetId,
	context?: PublicPricingLandingContext
): PublicPricingLandingPlanOverrides {
	const preset = PRESET_DEFINITIONS[presetId];
	const platformLabel = resolvePlatformLabel(context);

	if (preset.interpolatePlatformLabel && platformLabel) {
		return applyPlatformLabelToPlanOverrides(preset.planTabHeadlineOverrides, platformLabel);
	}

	const fallbackPresetId = PLATFORM_PRESET_HUB_FALLBACK[presetId];
	if (preset.interpolatePlatformLabel && !platformLabel && fallbackPresetId) {
		return getPublicPricingLandingPlanOverrides(fallbackPresetId);
	}

	return preset.planTabHeadlineOverrides ?? {};
}
