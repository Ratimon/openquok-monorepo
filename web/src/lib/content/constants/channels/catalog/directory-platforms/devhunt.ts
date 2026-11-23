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

const DEVHUNT_DOCS_PATH = '/docs/directory-integration/devhunt';

export const devhuntDirectoryChannel = {
	slug: 'devhunt',
	platformId: 'devhunt',
	platformLabel: 'DevHunt',
	icon: icons.DevHunt.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'devhunt',
	heroTitle: buildDirectoryChannelHeroTitle('DevHunt'),
	heroDescription: buildDirectoryChannelHeroDescription('DevHunt', 'devhunt.org'),
	metaTitle: 'DevHunt Listing — Developer Tool Launch & Directory',
	metaDescription:
		'Launch developer tools on DevHunt with OpenQuok. Autofill the new-tool form, track submissions, and publish on devhunt.org yourself.',
	hubDescription:
		'Autofill DevHunt free listing and paid launch paths from your business profile. You submit on devhunt.org.',
	keywords: [
		'DevHunt',
		'developer tool launch',
		'dev tool directory',
		'devhunt.org',
		'product hunt for developers',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'DevHunt',
		siteHost: 'devhunt.org',
		discoveryFieldsLabel: 'DevHunt categories and pricing type',
		autofillDescription:
			'Pick DevHunt Free listing or Paid launch. The extension opens devhunt.org with your profile. Edit fields, then submit on DevHunt — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'devhunt',
		platformLabel: 'DevHunt',
		siteHost: 'devhunt.org',
		safariMockContentId: 'directory-site-devhunt',
		buildBacklinksSiteSlug: 'devhunt',
		siteRulesStepContent:
			'DevHunt lists developer tools only. Skim the rules on devhunt.org before you launch from My Products — OpenQuok autofills, you publish on the site.',
		launchOpportunityStepContent:
			'DevHunt offers a free listing with a nofollow link, or a $49 launch week with a dofollow link and homepage placement. Pick the destination that fits your plan. Launch week checkout stays manual on DevHunt.'
	}),
	...buildDirectoryChannelWhoIsFor('DevHunt'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'DevHunt directory launch and extension autofill',
	faqDescription:
		'Free listing vs paid launch, profile fields, extension handoff, and submission tracking — how OpenQuok supports DevHunt today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to DevHunt for me?',
			description:
				`No. OpenQuok autofills the DevHunt new-tool form from your business profile. You review the page and submit on devhunt.org. See ${faqLink(DEVHUNT_DOCS_PATH, 'DevHunt directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on DevHunt?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Fill name, tagline, description, website, logo, gallery images, GitHub URL, and pricing type. Then open Add directory launch → DevHunt.`
		},
		{
			title: 'What is the difference between a free listing and a paid launch?',
			description:
				`A free listing gives a permanent tool page with a nofollow link to your site. A paid launch costs $49 on DevHunt. You pick a launch week and get a dofollow link, homepage placement, and newsletter exposure. OpenQuok lists each path as a separate destination. Details are in ${faqLink(DEVHUNT_DOCS_PATH, 'DevHunt directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about DevHunt backlinks?',
			description:
				`OpenQuok documents DevHunt on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/devhunt', 'DevHunt on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('DevHunt directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the devhunt.org handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: DEVHUNT_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;