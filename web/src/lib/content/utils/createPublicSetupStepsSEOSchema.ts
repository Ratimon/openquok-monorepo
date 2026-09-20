import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import type { HowTo } from 'schema-dts';
import {
	resolvePublicMcpSkillSetupSteps,
	resolvePublicMcpSkillSetupStepsSubtitle,
	resolvePublicMcpSkillSetupStepsTitle,
	type PublicMcpSkillSetupResolveInput
} from '$lib/content/constants/mcps/index';
import { createHowToSEOSchema } from '$lib/seo/createHowToSEOSchema';

export type PublicSetupStepsSectionCopy = {
	sectionTitle?: string;
	sectionSubtitle?: string;
	sectionDescription?: string;
	steps: readonly FeaturesOrderedStep[];
};

function normalizeHowToName(sectionTitle?: string): string | undefined {
	if (!sectionTitle?.trim()) {
		return undefined;
	}

	return sectionTitle.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeHowToDescription(copy: PublicSetupStepsSectionCopy): string | undefined {
	return copy.sectionDescription?.trim() || copy.sectionSubtitle?.trim() || undefined;
}

/**
 * JSON-LD `HowTo` for visible FeaturesOrdered setup sections (`#setup-steps`).
 * @see https://schema.org/HowTo
 */
export function createPublicSetupStepsSEOSchema(
	params: PublicSetupStepsSectionCopy & {
		pageUrl: string;
		fragmentId?: string;
	}
) {
	const { pageUrl, fragmentId = 'setup-steps', steps, sectionTitle, ...sectionCopy } = params;

	if (steps.length === 0) {
		return {};
	}

	const name = normalizeHowToName(sectionTitle);
	if (!name) {
		return {};
	}

	return createHowToSEOSchema({
		canonicalUrl: pageUrl.replace(/#.*$/, ''),
		fragmentId,
		name,
		description: normalizeHowToDescription({ steps, sectionTitle, ...sectionCopy }),
		steps: steps.map((step) => ({
			name: step.title.trim(),
			text: step.content.trim()
		}))
	});
}

/** MCP landing pages expose MCP and skill setup tabs — emit both HowTo nodes at SSR. */
export function buildPublicMcpSetupStepsSeoSchemas(params: {
	pageUrl: string;
	page: PublicMcpSkillSetupResolveInput & {
		setupStepsTitle: string;
		setupStepsSubtitle: string;
	};
}): Array<HowTo | Record<string, never>> {
	const { pageUrl, page } = params;

	return [
		createPublicSetupStepsSEOSchema({
			pageUrl,
			fragmentId: 'setup-steps',
			sectionTitle: page.setupStepsTitle,
			sectionSubtitle: page.setupStepsSubtitle,
			steps: page.setupSteps
		}),
		createPublicSetupStepsSEOSchema({
			pageUrl,
			fragmentId: 'skill-setup-steps',
			sectionTitle: resolvePublicMcpSkillSetupStepsTitle(page),
			sectionSubtitle: resolvePublicMcpSkillSetupStepsSubtitle(page),
			steps: resolvePublicMcpSkillSetupSteps(page)
		})
	];
}
