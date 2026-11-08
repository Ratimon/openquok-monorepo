import type {
	CompareDetailLongFormViewModel,
	CompareDirectoryLongFormContent,
	CompareLongFormPeerLink,
	CompareLongFormSection,
	CompareProduct
} from '$lib/content/constants/competitors/types';

import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import { faqHrefDocs } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

export function buildDirectoryOtherAlternativesSection(competitorName: string): CompareLongFormSection {
	return {
		id: 'other-alternatives',
		navLabel: 'Other alternatives',
		subtitle: 'Other alternatives',
		title: 'Other directory submission options',
		body: [
			`Compare OpenQuok to other directory services on the compare hub.`,
			'Each page covers pricing and whether you submit each listing yourself.'
		]
	};
}

export function buildSocialOtherAlternativesSection(competitorName: string): CompareLongFormSection {
	return {
		id: 'other-alternatives',
		navLabel: 'Other alternatives',
		subtitle: 'Other alternatives',
		title: 'Other social scheduler alternatives',
		body: [
			'Open other alternatives pages to rank schedulers against OpenQuok.',
			'Use the compare hub for a feature matrix between two products.'
		]
	};
}

export function buildOpenQuokOtherAlternativesSection(): CompareLongFormSection {
	return {
		id: 'other-alternatives',
		navLabel: 'Other alternatives',
		subtitle: 'Other alternatives',
		title: 'Other product alternative pages',
		body: [
			'Open alternatives pages for schedulers and directory services.',
			'Use the compare hub for a feature matrix between two products.'
		]
	};
}

export function personalizeWhenTheyWinSection(
	section: CompareLongFormSection,
	competitorName: string
): CompareLongFormSection {
	if (section.title.includes(competitorName)) return section;
	return {
		...section,
		title: section.title.replace(/\{competitor\}/g, competitorName)
	};
}

export function buildDefaultSocialAlternativesLongFormContent(
	target: CompareProduct
): CompareDirectoryLongFormContent {
	const { name } = target;
	return {
		whyPeopleLook: {
			id: 'why-people-look',
			navLabel: 'Why people look',
			subtitle: 'Why people look',
			title: `Why teams look for ${name} alternatives`,
			body: [
				`${name} ${target.comparison.positioningWhenLeft}.`,
				'Teams switch when pricing, channels, or agent workflows no longer fit.',
				'This page ranks options before you migrate accounts.'
			]
		},
		yourOptions: {
			id: 'your-options',
			navLabel: 'Your options',
			subtitle: 'Your options',
			title: 'Stay, switch schedulers, or adopt open source',
			body: [
				`You can renew ${name}, pick another scheduler, or move to OpenQuok.`,
				'The ranked list below shows schedulers with list prices and compare links.',
				'OpenQuok is open source with self-hosting, workspaces, and agent scheduling when those fit your stack.'
			]
		},
		whenTheyWin: {
			id: 'when-they-win',
			navLabel: 'When they win',
			subtitle: 'When they win',
			title: `When ${name} stays the better choice`,
			body: [
				`${name} is built for ${target.comparison.builtFor}.`,
				`You are happy with ${target.comparison.notAnother} and do not need workspaces or agent scheduling.`,
				'Migration cost is higher than the benefit this quarter.'
			]
		}
	};
}

export function assembleDirectoryLongFormViewModel(params: {
	competitor: CompareProduct;
	openQuok: CompareProduct;
	directoryLongForm: CompareDirectoryLongFormContent;
	otherAlternativePeers: readonly CompareLongFormPeerLink[];
}): CompareDetailLongFormViewModel {
	const { competitor, openQuok, directoryLongForm, otherAlternativePeers } = params;

	return {
		competitorSlug: competitor.slug,
		competitorName: competitor.name,
		openQuokName: openQuok.name,
		directorySubmissionToolPath: route(getRootPathPublicDirectorySubmissionTool()),
		chromeExtensionDocsPath: faqHrefDocs('installation/chrome-extension'),
		whyPeopleLook: directoryLongForm.whyPeopleLook,
		yourOptions: directoryLongForm.yourOptions,
		whenTheyWin: personalizeWhenTheyWinSection(directoryLongForm.whenTheyWin, competitor.name),
		otherAlternatives: buildDirectoryOtherAlternativesSection(competitor.name),
		otherAlternativePeers
	};
}

export function assembleSocialAlternativesLongFormViewModel(params: {
	competitor: CompareProduct;
	openQuok: CompareProduct;
	content: CompareDirectoryLongFormContent;
	otherAlternativePeers: readonly CompareLongFormPeerLink[];
}): CompareDetailLongFormViewModel {
	const { competitor, openQuok, content, otherAlternativePeers } = params;

	return {
		competitorSlug: competitor.slug,
		competitorName: competitor.name,
		openQuokName: openQuok.name,
		directorySubmissionToolPath: route(getRootPathPublicDirectorySubmissionTool()),
		chromeExtensionDocsPath: faqHrefDocs('installation/chrome-extension'),
		whyPeopleLook: content.whyPeopleLook,
		yourOptions: content.yourOptions,
		whenTheyWin: personalizeWhenTheyWinSection(content.whenTheyWin, competitor.name),
		otherAlternatives: buildSocialOtherAlternativesSection(competitor.name),
		otherAlternativePeers
	};
}
