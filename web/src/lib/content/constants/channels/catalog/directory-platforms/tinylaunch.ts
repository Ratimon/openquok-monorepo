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

const TINYLAUNCH_DOCS_PATH = '/docs/directory-integration/tinylaunch';

export const tinylaunchDirectoryChannel = {
	slug: 'tinylaunch',
	platformId: 'tinylaunch',
	platformLabel: 'TinyLaunch',
	icon: icons.TinyLaunch.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'tinylaunch',
	heroTitle: buildDirectoryChannelHeroTitle('TinyLaunch'),
	heroDescription: buildDirectoryChannelHeroDescription('TinyLaunch', 'tinylaunch.com'),
	metaTitle: 'TinyLaunch Listing — DR Tracking & Startup Directory Launch',
	metaDescription:
		'Grow domain rating and launch on TinyLaunch with OpenQuok. Autofill create-startup forms, track DR trends, and approve every listing on tinylaunch.com.',
	hubDescription:
		'Autofill TinyLaunch Premium and Standard launch from your business profile. You submit on tinylaunch.com.',
	keywords: [
		'TinyLaunch',
		'startup directory submission',
		'product directory launch',
		'tinylaunch.com',
		'startup launch calendar',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'TinyLaunch',
		siteHost: 'tinylaunch.com',
		discoveryFieldsLabel: 'TinyLaunch category',
		autofillDescription:
			'Pick TinyLaunch Premium or Standard launch. The extension opens tinylaunch.com with your profile. Edit fields, then submit on TinyLaunch — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'tinylaunch',
		platformLabel: 'TinyLaunch',
		siteHost: 'tinylaunch.com',
		safariMockContentId: 'directory-site-tinylaunch',
		buildBacklinksSiteSlug: 'tinylaunch',
		siteRulesStepContent:
			'TinyLaunch sets listing and backlink rules on tinylaunch.com. Skim the policy for your variant before you launch from My Products — OpenQuok autofills, you publish on the site.',
		launchOpportunityStepContent:
			'TinyLaunch offers Premium launch (paid slot on the pricing page) and a free Standard queue. Pick the destination that fits your budget. Dofollow terms can differ by variant — confirm on TinyLaunch before you pay.'
	}),
	...buildDirectoryChannelWhoIsFor('TinyLaunch'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'TinyLaunch directory launch and extension autofill',
	faqDescription:
		'Premium vs Standard queue, profile fields, extension handoff, and submission tracking — how OpenQuok supports TinyLaunch today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to TinyLaunch for me?',
			description:
				`No. OpenQuok autofills the TinyLaunch create-startup form from your business profile. You review the page and submit on tinylaunch.com. See ${faqLink(TINYLAUNCH_DOCS_PATH, 'TinyLaunch directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on TinyLaunch?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Fill name, tagline, description, website, logo, gallery images, and category. Then open Add directory launch → TinyLaunch.`
		},
		{
			title: 'What is the difference between Premium launch and Standard launch?',
			description:
				`TinyLaunch offers a paid Premium slot and a free Standard queue. OpenQuok lists each as a separate destination with its own start URL. Pick the variant that matches your plan on TinyLaunch. Details are in ${faqLink(TINYLAUNCH_DOCS_PATH, 'TinyLaunch directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about TinyLaunch backlinks?',
			description:
				`OpenQuok also documents TinyLaunch on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/tinylaunch', 'TinyLaunch on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('TinyLaunch directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the tinylaunch.com handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: TINYLAUNCH_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;