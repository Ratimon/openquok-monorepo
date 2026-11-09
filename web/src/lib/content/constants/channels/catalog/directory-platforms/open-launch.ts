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

const OPEN_LAUNCH_DOCS_PATH = '/docs/directory-integration/open-launch';

export const openLaunchDirectoryChannel = {
	slug: 'open-launch',
	platformId: 'open-launch',
	platformLabel: 'Open Launch',
	icon: icons.OpenLaunch.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'open-launch',
	heroTitle: buildDirectoryChannelHeroTitle('Open Launch'),
	heroDescription: buildDirectoryChannelHeroDescription('Open Launch', 'open-launch.com'),
	metaTitle: 'Open Launch Listing — DR Tracking & Product Directory Launch',
	metaDescription:
		'Grow domain rating and launch on Open Launch with OpenQuok. Autofill submit forms, track DR trends, and approve every listing on open-launch.com.',
	hubDescription:
		'Autofill Open Launch premium launch and free queue from your business profile. You submit on open-launch.com.',
	keywords: [
		'Open Launch',
		'startup directory submission',
		'product directory launch',
		'open-launch.com',
		'product launch directory',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'Open Launch',
		siteHost: 'open-launch.com',
		discoveryFieldsLabel: 'Open Launch categories and tech stack',
		autofillDescription:
			'Pick Open Launch premium launch or the free queue. The extension opens open-launch.com with your profile. Edit fields, then submit on Open Launch — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'open-launch',
		platformLabel: 'Open Launch',
		siteHost: 'open-launch.com',
		safariMockContentId: 'directory-site-open-launch',
		buildBacklinksSiteSlug: 'open-launch',
		siteRulesStepContent:
			'Open Launch sets listing and backlink rules on open-launch.com. Skim the policy for your variant before you launch from My Products — OpenQuok autofills, you publish on the site.',
		launchOpportunityStepContent:
			'Open Launch offers a premium launch ($12, 8:00 AM UTC slot) and a free queue. Pick the destination that fits your budget. Dofollow terms can differ by variant — confirm on Open Launch before you pay.'
	}),
	...buildDirectoryChannelWhoIsFor('Open Launch'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Open Launch directory launch and extension autofill',
	faqDescription:
		'Premium vs free queue, profile fields, extension handoff, and submission tracking — how OpenQuok supports Open Launch today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to Open Launch for me?',
			description:
				`No. OpenQuok autofills the Open Launch wizard from your business profile. You review the page and submit on open-launch.com. See ${faqLink(OPEN_LAUNCH_DOCS_PATH, 'Open Launch directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on Open Launch?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Fill name, description, website, logo, categories, and tech stack. Then open Add directory launch → Open Launch.`
		},
		{
			title: 'What is the difference between premium launch and the free queue?',
			description:
				`Open Launch offers a paid premium slot and a free queue path. OpenQuok lists each as a separate destination with its own start URL. Pick the variant that matches your plan on Open Launch. Details are in ${faqLink(OPEN_LAUNCH_DOCS_PATH, 'Open Launch directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about Open Launch backlinks?',
			description:
				`OpenQuok also documents Open Launch on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/open-launch', 'Open Launch on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('Open Launch directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the open-launch.com handoff',
				cliExamplesHref: publicFaqHref.cliOpenLaunch,
				cliExamplesLabel: 'Open Launch CLI examples',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: OPEN_LAUNCH_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
