import { icons } from '$data/icons';

import type { FeaturesOrderedStep } from '$lib/content/constants/agents/types';
import type { PublicSetupStepsFooter } from '$lib/content/constants/landing/setup-steps-footer';
import type { PublicDirectorySubmissionSectionHeader } from '$lib/content/constants/marketing/directory-submission-landing';
import type { SafariMockContentId } from '$lib/ui/templates/device-mocks/safari/safariMock.types';
import { getPublicBrowserExtensionChromeStoreCtaHref } from '$lib/content/constants/landing/browser-extension-chrome-cta';
import { route } from '$lib/utils/path';

export type PublicDirectoryChannelSlug = 'peerpush' | 'uneed' | 'open-launch';

export type DirectoryChannelProcessSection = PublicDirectorySubmissionSectionHeader & {
	steps: readonly FeaturesOrderedStep[];
	stepsFooter: PublicSetupStepsFooter;
};

export type DirectoryChannelProcessSectionParams = {
	channelSlug: PublicDirectoryChannelSlug;
	platformLabel: string;
	/** Host shown in Safari chrome (e.g. peerpush.com). */
	siteHost: string;
	safariMockContentId: SafariMockContentId;
	/** Step 3 — site rules and dofollow context. */
	siteRulesStepContent: string;
	/** Step 5 — free vs paid (or variant) opportunities on this directory. */
	launchOpportunityStepContent: string;
	buildBacklinksSiteSlug: string;
};

const PROCESS_SECTION_HEADER = {
	subtitle: 'How it works',
	title: 'Human-paced directory launch',
	description: 'You review every form before submit. OpenQuok autofills from your profile.'
} satisfies PublicDirectorySubmissionSectionHeader;

/**
 * Six-step `FeaturesOrdered` block for `/channels/{directory-slug}` — mirrors the tool landing flow,
 * tailored per directory (Chrome Web Store install, Safari site preview, dofollow copy, launch variants).
 */
export function buildDirectoryChannelProcessSection(
	params: DirectoryChannelProcessSectionParams
): DirectoryChannelProcessSection {
	const {
		platformLabel,
		siteHost,
		safariMockContentId,
		siteRulesStepContent,
		launchOpportunityStepContent,
		buildBacklinksSiteSlug
	} = params;

	const chromeWebStoreListingUrl = getPublicBrowserExtensionChromeStoreCtaHref();

	const steps: FeaturesOrderedStep[] = [
		{
			id: 1,
			title: 'Install the Chrome extension',
			content:
				`Add OpenQuok from the Chrome Web Store and pin the toolbar icon. You need it before ${platformLabel} autofill on ${siteHost}.`,
			iconName: icons.CustomizedDrawnLaptop.name,
			deviceMock: 'safari',
			deviceMockContent: 'chrome-web-store-openquok' satisfies SafariMockContentId,
			mockUrl: 'chromewebstore.google.com',
			mockLinkHref: chromeWebStoreListingUrl,
			mediaAlt: 'OpenQuok extension listing on the Chrome Web Store'
		},
		{
			id: 2,
			title: 'Build one profile',
			content:
				`Add name, tagline, logo, and links in My Products. Fill ${platformLabel} fields before you open ${siteHost}.`,
			iconName: icons.CustomizedDrawnHouse.name,
			marketingPanel: 'directory-profile-readiness',
			mediaAlt: `Profile ready for ${platformLabel}`
		},
		{
			id: 3,
			title: `Read ${platformLabel} listing rules`,
			content: siteRulesStepContent,
			iconName: icons.Globe.name,
			deviceMock: 'safari',
			mockUrl: siteHost,
			deviceMockContent: safariMockContentId,
			mediaAlt: `${platformLabel} submit page in Safari with listing policy callout`
		},
		{
			id: 4,
			title: 'Review autofilled forms',
			content:
				`Open ${siteHost} with the Chrome extension. Edit fields, then submit on ${platformLabel}.`,
			iconName: icons.BookOpenCheck.name,
			marketingPanel: 'directory-extension-autofill',
			mediaAlt: `${platformLabel} form with autofilled profile fields`
		},
		{
			id: 5,
			title: 'Choose free or paid path',
			content: launchOpportunityStepContent,
			iconName: icons.Timer.name,
			marketingPanel: 'directory-launch-opportunities',
			mediaAlt: `${platformLabel} free and paid launch options in My Products`
		},
		{
			id: 6,
			title: 'Track status and URLs',
			content: `Mark submitted and save each live ${platformLabel} listing URL in My Products.`,
			iconName: icons.ListOrdered.name,
			marketingPanel: 'directory-track-status',
			mediaAlt: `Submitted status and listing URLs for ${platformLabel}`
		}
	];

	return {
		...PROCESS_SECTION_HEADER,
		title: `Launch on ${platformLabel} at your pace`,
		steps,
		stepsFooter: {
			footerPrompt: 'Compare dofollow and cost?',
			footerLinkLabel: `Open ${platformLabel} on Build backlinks`,
			footerLinkHref: route(`build-backlinks/${buildBacklinksSiteSlug}`)
		}
	};
}
