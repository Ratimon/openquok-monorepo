import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import type { HowTo } from 'schema-dts';
import {
	resolvePublicMcpSkillSetupSteps,
	resolvePublicMcpSkillSetupStepsSubtitle,
	resolvePublicMcpSkillSetupStepsTitle,
	type PublicMcpSkillSetupResolveInput
} from '$lib/content/constants/mcps/index';
import { createHowToSEOSchema } from '$lib/seo/createHowToSEOSchema';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

export type PublicSetupStepsSectionCopy = {
	sectionTitle?: string;
	sectionSubtitle?: string;
	sectionDescription?: string;
	steps: readonly FeaturesOrderedStep[];
};

/** One visible `FeaturesOrdered` block → one `HowTo` node (`fragmentId` = DOM `sectionId`). */
export type PublicFeaturesOrderedHowToSection = PublicSetupStepsSectionCopy & {
	sectionId: string;
};

function resolveHowToStepUrl(pageUrl: string, howToStepUrl: string): string {
	const trimmed = howToStepUrl.trim();
	if (!trimmed) {
		return trimmed;
	}
	if (trimmed.startsWith('#')) {
		return `${pageUrl.replace(/#.*$/, '')}${trimmed}`;
	}
	return trimmed;
}

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
		steps: steps.map((step) => {
			const howToStepUrl = step.howToStepUrl?.trim();
			return {
				name: step.title.trim(),
				text: stripHtmlToPlainText((step.content ?? '').trim()),
				...(howToStepUrl ? { url: resolveHowToStepUrl(pageUrl, howToStepUrl) } : {})
			};
		})
	});
}

/** Emit one `HowTo` per `FeaturesOrdered` section (e.g. build-backlinks site + opportunity guides). */
export function buildPublicFeaturesOrderedHowToSchemas(params: {
	pageUrl: string;
	sections: readonly PublicFeaturesOrderedHowToSection[];
}): Array<HowTo | Record<string, never>> {
	const { pageUrl, sections } = params;

	return sections.map((section) =>
		createPublicSetupStepsSEOSchema({
			pageUrl,
			fragmentId: section.sectionId,
			sectionTitle: section.sectionTitle,
			sectionSubtitle: section.sectionSubtitle,
			sectionDescription: section.sectionDescription,
			steps: section.steps
		})
	);
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
