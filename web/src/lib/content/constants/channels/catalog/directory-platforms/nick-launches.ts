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

const NICK_LAUNCHES_DOCS_PATH = '/docs/directory-integration/nick-launches';

export const nickLaunchesDirectoryChannel = {
	slug: 'nick-launches',
	platformId: 'nick-launches',
	platformLabel: 'Nick Launches',
	icon: icons.NickLaunches.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'nick-launches',
	heroTitle: buildDirectoryChannelHeroTitle('Nick Launches'),
	heroDescription: buildDirectoryChannelHeroDescription('Nick Launches', 'nicklaunches.com'),
	metaTitle: 'Nick Launches Listing — Product Launch Directory & Maker Profile',
	metaDescription:
		'Launch on Nick Launches with OpenQuok. Autofill the listing form and maker profile, track submissions, and submit on nicklaunches.com yourself.',
	hubDescription:
		'Autofill Nick Launches free launch, paid launch, and maker profile from your business profile. You submit on nicklaunches.com.',
	keywords: [
		'Nick Launches',
		'product launch directory',
		'startup launch',
		'nicklaunches.com',
		'maker profile',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'Nick Launches',
		siteHost: 'nicklaunches.com',
		discoveryFieldsLabel: 'Nick Launches categories and pricing type',
		autofillDescription:
			'Pick free launch, paid launch, or maker profile in one dashboard. The extension opens nicklaunches.com with your profile. Edit fields, then submit on Nick Launches — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'nick-launches',
		platformLabel: 'Nick Launches',
		siteHost: 'nicklaunches.com',
		safariMockContentId: 'directory-site-nick-launches',
		buildBacklinksSiteSlug: 'nick-launches',
		siteRulesStepContent:
			'Nick Launches lists products with admin review on every path. Skim free vs paid dofollow rules and badge requirements on nicklaunches.com before you launch from My Products — OpenQuok autofills, you publish on the site.',
		launchOpportunityStepContent:
			'Choose a free listing with weekly upvotes and a live Featured badge for dofollow, a paid tier with optional badge, or a standalone maker profile. Plan checkout on /submit/plan/ stays manual after the listing form.'
	}),
	...buildDirectoryChannelWhoIsFor('Nick Launches'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Nick Launches directory launch and extension autofill',
	faqDescription:
		'Free vs paid launch, maker profile, profile fields, extension handoff, and submission tracking — how OpenQuok supports Nick Launches today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to Nick Launches for me?',
			description:
				`No. OpenQuok autofills the Nick Launches listing and profile forms from your business profile. You review the page and submit on nicklaunches.com. See ${faqLink(NICK_LAUNCHES_DOCS_PATH, 'Nick Launches directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on Nick Launches?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Fill name, tagline, description, website, logo, gallery images, categories, pricing type, and social links. Then open Add directory launch → Nick Launches.`
		},
		{
			title: 'What is the difference between free launch, paid launch, and maker profile?',
			description:
				`Free launch and paid launch share one listing form; paid tiers unlock featured placement and may make the Featured badge optional for dofollow. You pick a plan later on nicklaunches.com/submit/plan/. Maker profile is a separate /profile/ form for your personal page. OpenQuok lists each path as its own destination. Details are in ${faqLink(NICK_LAUNCHES_DOCS_PATH, 'Nick Launches directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about Nick Launches backlinks?',
			description:
				`OpenQuok documents Nick Launches on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/nick-launches', 'Nick Launches on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('Nick Launches directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the nicklaunches.com handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: NICK_LAUNCHES_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;