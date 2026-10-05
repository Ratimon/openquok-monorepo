import type { IconName } from '$data/icons';

import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import {
	getPublicConnectChannelsSetupStepsFooter,
	getPublicCreatingPostsSetupStepsFooter,
	PUBLIC_SETUP_STEPS_FOOTER_PROMPT
} from '$lib/content/constants/landing/setup-steps-footer';
import type {
	LinkDirectoryOpportunityDto,
	LinkDirectorySiteDto
} from '$lib/link-directory/link-directory.types';
import {
	buildBuildBacklinksOpportunityBentoStep,
	buildBuildBacklinksOpportunityStepMedia,
	type BuildBacklinksOpportunityBentoFields
} from '$lib/link-directory/utils/buildBuildBacklinksOpportunityBentoStep';
import {
	formatOpportunityIndexTitle,
	formatSubStepTitle
} from '$lib/link-directory/utils/formatBuildBacklinksGuideDisplayTitle';
import { buildBacklinksGuideOrdinalIcon } from '$lib/link-directory/utils/buildBacklinksGuideOrdinalIcon';
import { resolveOpportunityCta } from '$lib/link-directory/utils/resolveOpportunityCtaHref';

export type BuildBacklinksGuideOverviewCardVm = {
	slug: string;
	/** CMS opportunity name (main card title). */
	title: string;
	/** e.g. `1st Backlink Opportunity` */
	eyebrow: string;
	description: string;
	anchorId: string;
	icon: IconName;
};

export type BuildBacklinksGuideDisplayStepVm = {
	order: number;
	/** e.g. `1st Step` */
	displayTitle: string;
	/** CMS sub-step title */
	stepTitle: string;
	content: string;
	iconName: IconName;
	/** When set, overrides `sectionMedia` for this step in the steps panel. */
	stepMedia?: BuildBacklinksOpportunityBentoFields;
};

export type BuildBacklinksGuideSectionVm = {
	sectionId: string;
	sectionSubtitle?: string;
	sectionTitle: string;
	/** Ordinal eyebrow for UI (e.g. `1st Backlink Opportunity`); `sectionTitle` stays the CMS name for HowTo. */
	displaySectionTitle?: string;
	/** CMS opportunity title shown as the main heading below the eyebrow. */
	displaySectionSubtitle?: string;
	sectionDescription?: string;
	steps: FeaturesOrderedStep[];
	/** Numbered sub-step labels for static step lists (schema uses unnumbered `steps[].title`). */
	displaySteps?: BuildBacklinksGuideDisplayStepVm[];
	/** Site overview cards linking to `#howto-{slug}` (`howto-site` only). */
	overviewCards?: BuildBacklinksGuideOverviewCardVm[];
	/** Single device mock per opportunity section. */
	sectionMedia?: BuildBacklinksOpportunityBentoFields;
	/** Alternate bento layout on overview steps (even opportunity index). */
	ltr?: boolean;
	footer?: {
		footerPrompt: string;
		footerLinkLabel: string;
		footerLinkHref: string;
	};
	/** Per-opportunity sections only — drives facet badges in the template. */
	badgesOpportunity?: LinkDirectoryOpportunityDto;
};

export function sortPublishedOpportunities(
	opportunities: LinkDirectoryOpportunityDto[]
): LinkDirectoryOpportunityDto[] {
	return [...opportunities]
		.filter((opportunity) => opportunity.isAdminPublished)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

function opportunityStepFallbackText(name: string): string {
	return `Follow the detailed steps for “${name}” on this guide.`;
}

function formatOpportunitySectionDescription(opportunity: LinkDirectoryOpportunityDto): string {
	const parts: string[] = [];
	const description = opportunity.description?.trim();
	if (description) {
		parts.push(description);
	}
	if (opportunity.approvalTimeHint?.trim()) {
		parts.push(`Approval: ${opportunity.approvalTimeHint.trim()}`);
	}
	if (opportunity.costNote?.trim()) {
		parts.push(opportunity.costNote.trim());
	}
	return parts.join(' ');
}

function mapOpportunitySubSteps(opportunity: LinkDirectoryOpportunityDto): FeaturesOrderedStep[] {
	const sorted = [...(opportunity.steps ?? [])].sort((a, b) => a.order - b.order);
	if (sorted.length === 0) {
		const name = opportunity.title.trim();
		const content =
			opportunity.description?.trim() || (name ? opportunityStepFallbackText(name) : '');
		if (!name || !content) {
			return [];
		}
		return [
			{
				id: 1,
				title: name,
				content,
				iconName: buildBacklinksGuideOrdinalIcon(1)
			}
		];
	}

	return sorted.map((step) => ({
		id: step.order,
		title: step.title,
		content: step.body,
		iconName: buildBacklinksGuideOrdinalIcon(step.order)
	}));
}

function mapDisplaySteps(
	opportunity: LinkDirectoryOpportunityDto,
	steps: FeaturesOrderedStep[],
	siteUrl?: string
): BuildBacklinksGuideDisplayStepVm[] {
	return steps.map((step, index) => {
		const order = typeof step.id === 'number' ? step.id : index + 1;
		const iconName = step.iconName ?? buildBacklinksGuideOrdinalIcon(order);
		const stepMedia = buildBuildBacklinksOpportunityStepMedia(opportunity, order, siteUrl);
		return {
			order,
			displayTitle: formatSubStepTitle(order),
			stepTitle: step.title,
			content: step.content,
			iconName,
			...(stepMedia ? { stepMedia } : {})
		};
	});
}

function resolveSectionFooter(
	opportunity: LinkDirectoryOpportunityDto
): BuildBacklinksGuideSectionVm['footer'] | undefined {
	switch (opportunity.openquokCtaKind) {
		case 'schedule_post':
			return getPublicCreatingPostsSetupStepsFooter();
		case 'connect_channel':
			return getPublicConnectChannelsSetupStepsFooter();
		case 'use_plug': {
			const cta = resolveOpportunityCta({
				kind: opportunity.openquokCtaKind,
				channelSlug: opportunity.openquokChannelSlug,
				ctaHref: opportunity.ctaHref,
				ctaLabel: opportunity.ctaLabel
			});
			if (!cta) {
				return undefined;
			}
			return {
				footerPrompt: PUBLIC_SETUP_STEPS_FOOTER_PROMPT,
				footerLinkLabel: cta.label,
				footerLinkHref: cta.href
			};
		}
		default: {
			const cta = resolveOpportunityCta({
				kind: opportunity.openquokCtaKind,
				channelSlug: opportunity.openquokChannelSlug,
				ctaHref: opportunity.ctaHref,
				ctaLabel: opportunity.ctaLabel
			});
			if (!cta) {
				return undefined;
			}
			return {
				footerPrompt: PUBLIC_SETUP_STEPS_FOOTER_PROMPT,
				footerLinkLabel: cta.label,
				footerLinkHref: cta.href
			};
		}
	}
}

export type BuildBacklinksGuideSiteInput = Pick<
	LinkDirectorySiteDto,
	'title' | 'shortDescription' | 'opportunities'
> & {
	siteUrl?: LinkDirectorySiteDto['siteUrl'];
};

/** Single VM for site guide sections and JSON-LD (`buildPublicFeaturesOrderedHowToSchemas` in `$lib/seo`). */
export function buildBuildBacklinksGuideSections(params: {
	canonical: string;
	site: BuildBacklinksGuideSiteInput | LinkDirectorySiteDto;
}): BuildBacklinksGuideSectionVm[] {
	const { site } = params;
	const siteTitle = site.title.trim();
	const siteUrl = site.siteUrl?.trim() || undefined;
	const ordered = sortPublishedOpportunities(site.opportunities ?? []);

	const overviewSteps: FeaturesOrderedStep[] = ordered
		.map((opportunity, index): FeaturesOrderedStep | null => {
			const name = opportunity.title.trim();
			if (!name) {
				return null;
			}
			const content =
				opportunity.description?.trim() || opportunityStepFallbackText(name);
			return {
				id: index + 1,
				title: name,
				content,
				howToStepUrl: `#howto-${opportunity.slug}`,
				iconName: buildBacklinksGuideOrdinalIcon(index + 1)
			};
		})
		.filter((step): step is FeaturesOrderedStep => step !== null);

	const overviewCards: BuildBacklinksGuideOverviewCardVm[] = ordered
		.map((opportunity, index) => {
			const name = opportunity.title.trim();
			if (!name) {
				return null;
			}
			const sectionMedia = buildBuildBacklinksOpportunityBentoStep(opportunity, siteUrl);
			return {
				slug: opportunity.slug,
				eyebrow: formatOpportunityIndexTitle(index + 1),
				title: name,
				description:
					opportunity.description?.trim() || opportunityStepFallbackText(name),
				anchorId: `howto-${opportunity.slug}`,
				icon: buildBacklinksGuideOrdinalIcon(index + 1)
			};
		})
		.filter((card): card is BuildBacklinksGuideOverviewCardVm => card !== null);

	const sections: BuildBacklinksGuideSectionVm[] = [];

	if (overviewSteps.length > 0 && siteTitle) {
		sections.push({
			sectionId: 'howto-site',
			sectionSubtitle: 'All backlink opportunities',
			sectionTitle: `Backlink opportunities,on ${siteTitle}`,
			sectionDescription: site.shortDescription?.trim() || undefined,
			steps: overviewSteps,
			overviewCards
		});
	}

	for (const [opportunityIndex, opportunity] of ordered.entries()) {
		const title = opportunity.title.trim();
		if (!title) {
			continue;
		}
		const steps = mapOpportunitySubSteps(opportunity);
		if (steps.length === 0) {
			continue;
		}

		sections.push({
			sectionId: `howto-${opportunity.slug}`,
			sectionTitle: title,
			displaySectionTitle: formatOpportunityIndexTitle(opportunityIndex + 1),
			displaySectionSubtitle: title,
			sectionDescription: formatOpportunitySectionDescription(opportunity) || undefined,
			steps,
			displaySteps: mapDisplaySteps(opportunity, steps, siteUrl),
			sectionMedia: buildBuildBacklinksOpportunityBentoStep(opportunity, siteUrl),
			ltr: opportunityIndex % 2 === 1,
			footer: resolveSectionFooter(opportunity),
			badgesOpportunity: opportunity
		});
	}

	return sections;
}

/** Opportunity sections that ship nested `HowTo` JSON-LD (sub-steps only). */
export function listBuildBacklinksGuideOpportunityHowToSections(
	sections: readonly BuildBacklinksGuideSectionVm[]
): BuildBacklinksGuideSectionVm[] {
	return sections.filter(
		(section) =>
			section.sectionId !== 'howto-site' &&
			(section.badgesOpportunity?.steps?.length ?? 0) > 0
	);
}
