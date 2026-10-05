import { PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION } from '$lib/content/constants/agents/general';
import {
	buildMessagingGatewayFeatureSections,
	buildMessagingGatewaySetupSteps
} from '$lib/content/constants/agents/archetypes/messaging-gateway';
import { buildMessagingGatewayAgentFaqItems } from '$lib/content/constants/agents/archetypes/messaging-gateway-faq';
import { requireAgentHostProfile } from '$lib/content/constants/agents/host-profiles';
import { mergeAgentLandingFaqItems } from '$lib/content/constants/agents/mergeAgentLandingFaqItems';
import type {
	AgentHostLandingSeed,
	PublicAgentHostLandingPageViewModel
} from '$lib/content/constants/agents/types';

export function buildAgentHostLandingPage(
	seed: AgentHostLandingSeed
): PublicAgentHostLandingPageViewModel {
	const profile = requireAgentHostProfile(seed.slug);
	const { agentLabel, overrides } = seed;

	let setupSteps = overrides?.setupSteps;
	let featureSections = overrides?.featureSections;

	if (profile.uiArchetype === 'messaging-gateway') {
		if (!seed.messagingGateway) {
			throw new Error(`Agent host seed "${seed.slug}" requires messagingGateway params`);
		}
		setupSteps = setupSteps ?? buildMessagingGatewaySetupSteps(seed.messagingGateway);
		featureSections = featureSections ?? buildMessagingGatewayFeatureSections(seed.messagingGateway);
	}

	if (!setupSteps || !featureSections) {
		throw new Error(
			`Agent host seed "${seed.slug}" must supply setupSteps and featureSections or a supported uiArchetype builder`
		);
	}

	if (overrides?.firstFeatureSection) {
		featureSections = [overrides.firstFeatureSection, ...featureSections.slice(1)];
	}

	const defaultFaqItems = seed.messagingGatewayFaq
		? buildMessagingGatewayAgentFaqItems(seed.messagingGatewayFaq)
		: seed.faqItems;

	if (!defaultFaqItems?.length) {
		throw new Error(
			`Agent host seed "${seed.slug}" must supply faqItems or messagingGatewayFaq for default FAQs`
		);
	}

	const faqItems = mergeAgentLandingFaqItems(defaultFaqItems, overrides);

	const audienceCards = overrides?.audienceCards ?? seed.audienceCards;

	return {
		pageType: 'agent-host',
		slug: seed.slug,
		agentId: seed.agentId,
		agentLabel: seed.agentLabel,
		telegramBotLabel: seed.telegramBotLabel,
		icon: seed.icon,
		heroSecondaryIcon: seed.heroSecondaryIcon,
		available: seed.available,
		metaTitle: seed.metaTitle,
		metaDescription: seed.metaDescription,
		hubDescription: seed.hubDescription,
		keywords: [...seed.keywords],
		heroTitle: seed.heroTitle,
		heroDescription: seed.heroDescription,
		docsPath: seed.docsPath,
		skillInstallOptions: seed.skillInstallOptions,
		workflowSection: seed.workflowSection,
		audienceSubtitle: seed.audienceSubtitle,
		audienceTitle: seed.audienceTitle,
		audienceCards,
		setupStepsSubtitle: 'How it works',
		setupStepsTitle: `Five steps,to ${agentLabel} + OpenQuok`,
		setupSteps,
		featureSections,
		opportunitiesPreviewSection: PUBLIC_AGENT_OPPORTUNITIES_PREVIEW_SECTION,
		comparisonSection: seed.comparisonSection,
		commandReferenceSection: seed.commandReferenceSection,
		supportedChannelsSection: seed.supportedChannelsSection,
		faqSubtitle: seed.faqSubtitle,
		faqTitle: seed.faqTitle,
		faqDescription: seed.faqDescription,
		faqItems
	};
}
