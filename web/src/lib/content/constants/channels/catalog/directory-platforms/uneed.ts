import { icons } from '$data/icons';

import { buildDirectoryChannelFeatureSections } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelFeatureSections';
import {
	buildDirectoryChannelHeroDescription,
	buildDirectoryChannelHeroTitle,
	buildDirectoryChannelWhoIsFor
} from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelLandingShared';
import { buildDirectoryChannelProcessSection } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelProcessSection';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	faqHrefDocs,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const UNEED_DOCS_PATH = '/docs/directory-integration/uneed';

export const uneedDirectoryChannel = {
	slug: 'uneed',
	platformId: 'uneed',
	platformLabel: 'Uneed',
	icon: icons.Uneed.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'uneed',
	heroTitle: buildDirectoryChannelHeroTitle('Uneed'),
	heroDescription: buildDirectoryChannelHeroDescription('Uneed', 'uneed.best'),
	metaTitle: 'Uneed Launch — DR Tracking & Product Directory Listings',
	metaDescription:
		'Grow domain rating and launch on Uneed with OpenQuok. Autofill Uneed forms, track DR trends, and approve every listing on uneed.best.',
	hubDescription:
		'Autofill Uneed Join the line, paid launch, and maker profile from your business profile. You submit on uneed.best.',
	keywords: [
		'Uneed',
		'startup directory submission',
		'product directory launch',
		'Uneed launch',
		'join the line Uneed',
		'product launch directory',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'Uneed',
		siteHost: 'uneed.best',
		discoveryFieldsLabel: 'Uneed pricing and maker fields',
		autofillDescription:
			'Pick Join the line, paid launch, or maker profile in one dashboard. The extension opens uneed.best with your profile. Edit fields, then submit on Uneed — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'uneed',
		platformLabel: 'Uneed',
		siteHost: 'uneed.best',
		safariMockContentId: 'directory-site-uneed',
		buildBacklinksSiteSlug: 'uneed',
		siteRulesStepContent:
			'Uneed sets backlink and listing rules per flow on uneed.best. Skim the policy for your variant before you launch from one dashboard — OpenQuok autofills, you publish on Uneed.',
		launchOpportunityStepContent:
			'Choose Join the line (free wait), a paid launch slot, or maker profile in one dashboard. Each path has different timing and dofollow terms — pick what matches your goals, then confirm details on Uneed.'
	}),
	...buildDirectoryChannelWhoIsFor('Uneed'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Uneed directory launch and extension autofill',
	faqDescription:
		'Join the line vs paid launch, profile fields, extension handoff, and submission tracking — how OpenQuok supports Uneed today.',
	faqItems: [
		{
			title: 'Does OpenQuok post my product to Uneed automatically?',
			description:
				`No. OpenQuok fills Uneed forms from your business profile. You review and submit on uneed.best. See ${faqLink(UNEED_DOCS_PATH, 'Uneed directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'Which Uneed launch paths does OpenQuok support?',
			description:
				`OpenQuok ships separate destinations for Join the line, paid launch, and maker profile when they are published in the auto-launch catalog. Each has its own start URL and extension config. Compare variants in ${faqLink(UNEED_DOCS_PATH, 'Uneed directory integration')}.`
		},
		{
			title: 'What should I prepare in my dashboard first?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the ${faqLink(faqHrefDocs('installation/chrome-extension'), 'OpenQuok browser extension')}, and complete the product profile fields Uneed expects — name, tagline, description, website, logo, and discovery tags. The readiness panel lists anything still missing.`
		},
		{
			title: 'Where can I read Uneed backlink and cost notes?',
			description:
				`Editorial catalog pages cover dofollow and pricing context. See ${faqLink('/build-backlinks/uneed', 'Uneed on Build backlinks')} and the ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')} hub section.`
		}
	],
	docsPath: UNEED_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
