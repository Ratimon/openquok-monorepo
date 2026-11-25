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
	buildChannelProgrammaticDirectoryLaunchFaqDescription,
	buildChannelProgrammaticDirectoryLaunchFaqTitle,
	faqHrefDocs,
	faqLink,
	faqLinkChromeWebStore,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const ALTERNATIVETO_DOCS_PATH = '/docs/directory-integration/alternativeto';

export const alternativetoDirectoryChannel = {
	slug: 'alternativeto',
	platformId: 'alternativeto',
	platformLabel: 'AlternativeTo',
	icon: icons.AlternativeTo.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'alternativeto',
	heroTitle: buildDirectoryChannelHeroTitle('AlternativeTo'),
	heroDescription: buildDirectoryChannelHeroDescription('AlternativeTo', 'alternativeto.net'),
	metaTitle: 'AlternativeTo Listing — Software Alternatives Directory',
	metaDescription:
		'List on AlternativeTo with OpenQuok. Autofill manage-item from your business profile, track submissions, and submit on alternativeto.net yourself.',
	hubDescription:
		'Autofill AlternativeTo free listing, paid review tiers, and user profile paths from your business profile. You submit on alternativeto.net.',
	keywords: [
		'AlternativeTo',
		'software alternatives',
		'app directory',
		'alternativeto.net',
		'dofollow backlink',
		'product listing',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'AlternativeTo',
		siteHost: 'alternativeto.net',
		discoveryFieldsLabel: 'AlternativeTo tags and supported platforms',
		autofillDescription:
			'Pick free listing, Priority Review, or Finish listing in one dashboard. The extension opens alternativeto.net/manage-item/ with your profile. Edit fields, submit on AlternativeTo, and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'alternativeto',
		platformLabel: 'AlternativeTo',
		siteHost: 'alternativeto.net',
		safariMockContentId: 'directory-site-alternativeto',
		buildBacklinksSiteSlug: 'alternativeto',
		siteRulesStepContent:
			'AlternativeTo lists English-only software with tags, platforms, and license type. Skim the FAQ on alternativeto.net before you launch from My Products — OpenQuok autofills manage-item; final submit and paid upsells stay on the site.',
		launchOpportunityStepContent:
			'Free listing joins a long review queue. Optional Priority Review ($15) or We finish it ($29) expedite after submit — checkout stays manual on AlternativeTo. OpenQuok lists each path as its own destination.'
	}),
	...buildDirectoryChannelWhoIsFor('AlternativeTo'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'AlternativeTo directory launch and extension autofill',
	faqDescription:
		'Free vs paid review, profile fields, extension handoff, and submission tracking — how OpenQuok supports AlternativeTo today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to AlternativeTo for me?',
			description:
				`No. OpenQuok autofills alternativeto.net/manage-item/ from your business profile. You review the page and submit on AlternativeTo yourself. See ${faqLink(ALTERNATIVETO_DOCS_PATH, 'AlternativeTo directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on AlternativeTo?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Fill name, tagline, description, website, logo, gallery images, tags, platforms, and pricing type. Verify your email on AlternativeTo, then open Add directory launch → AlternativeTo.`
		},
		{
			title: 'What is the difference between free listing and Priority Review?',
			description:
				`The free path uses the same manage-item form but waits in a long review queue. Priority Review ($15) and We finish it ($29) are optional Stripe upsells after submit. OpenQuok lists each tier as its own destination. Details are in ${faqLink(ALTERNATIVETO_DOCS_PATH, 'AlternativeTo directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about AlternativeTo backlinks?',
			description:
				`OpenQuok documents AlternativeTo on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/alternativeto', 'AlternativeTo on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('AlternativeTo directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the alternativeto.net handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: ALTERNATIVETO_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;