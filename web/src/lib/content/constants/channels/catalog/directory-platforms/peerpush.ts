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
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const PEERPUSH_DOCS_PATH = '/docs/directory-integration/peerpush';

export const peerpushDirectoryChannel = {
	slug: 'peerpush',
	platformId: 'peerpush',
	platformLabel: 'PeerPush',
	icon: icons.PeerPush.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'peerpush',
	heroTitle: buildDirectoryChannelHeroTitle('PeerPush'),
	heroDescription: buildDirectoryChannelHeroDescription('PeerPush', 'peerpush.com'),
	metaTitle: 'PeerPush Launch — DR Tracking & Directory Backlinks',
	metaDescription:
		'Grow domain rating and launch on PeerPush with OpenQuok. Autofill PeerPush forms, track DR and competitors, and approve every listing on peerpush.com.',
	hubDescription:
		'Autofill PeerPush Standard launch and free queue from your business profile. You submit on peerpush.com.',
	keywords: [
		'PeerPush',
		'startup directory submission',
		'product directory launch',
		'submit startup to directories',
		'PeerPush launch',
		'dofollow backlink',
		'product launch directory',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'PeerPush',
		siteHost: 'peerpush.com',
		discoveryFieldsLabel: 'PeerPush categories',
		autofillDescription:
			'Pick PeerPush Standard launch or Free queue. The extension opens peerpush.com with your profile. Edit fields, then submit on PeerPush — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'peerpush',
		platformLabel: 'PeerPush',
		siteHost: 'peerpush.com',
		safariMockContentId: 'directory-site-peerpush',
		buildBacklinksSiteSlug: 'peerpush',
		siteRulesStepContent:
			'PeerPush sets its own dofollow and listing rules on peerpush.com. Read them before you add a launch in My Products — OpenQuok maps your profile, you submit on the site.',
		launchOpportunityStepContent:
			'PeerPush offers Standard launch (paid, faster publish) and a free queue. Pick the destination in My Products that fits your budget. Dofollow terms can differ by variant — confirm on PeerPush before you pay.'
	}),
	...buildDirectoryChannelWhoIsFor('PeerPush'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'PeerPush directory launch and extension autofill',
	faqDescription:
		'Business profile fields, Standard launch vs free queue, extension handoff, and submission tracking — how OpenQuok supports PeerPush today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to PeerPush for me?',
			description:
				`No. OpenQuok autofills the PeerPush form from your business profile. You review the page and click submit on peerpush.com. See ${faqLink(PEERPUSH_DOCS_PATH, 'PeerPush directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on PeerPush?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the ${faqLink(faqHrefDocs('installation/chrome-extension'), 'OpenQuok browser extension')}, and create a product in My Products. Fill name, tagline, description, website, logo, and PeerPush discovery fields. Then open Add directory launch → PeerPush.`
		},
		{
			title: 'What is the difference between Standard launch and the free queue?',
			description:
				`PeerPush offers paid instant publish and a free queue path. OpenQuok lists each as a separate destination with its own start URL. Pick the variant that matches your plan on PeerPush. Details are in ${faqLink(PEERPUSH_DOCS_PATH, 'PeerPush directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about PeerPush backlinks?',
			description:
				`OpenQuok also documents PeerPush on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/peerpush', 'PeerPush on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('PeerPush directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the peerpush.com handoff',
				cliExamplesHref: publicFaqHref.cliPeerpush,
				cliExamplesLabel: 'PeerPush CLI examples',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: PEERPUSH_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
