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

const FAZIER_DOCS_PATH = '/docs/directory-integration/fazier';

export const fazierDirectoryChannel = {
	slug: 'fazier',
	platformId: 'fazier',
	platformLabel: 'Fazier',
	icon: icons.Fazier.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'fazier',
	heroTitle: buildDirectoryChannelHeroTitle('Fazier'),
	heroDescription: buildDirectoryChannelHeroDescription('Fazier', 'fazier.com'),
	metaTitle: 'Fazier Listing — Company Page & Product Launch Directory',
	metaDescription:
		'Launch on Fazier with OpenQuok. Autofill company pages and product listings from your business profile, track submissions, and publish on fazier.com yourself.',
	hubDescription:
		'Autofill Fazier company pages and product launches from your business profile. You submit on fazier.com.',
	keywords: [
		'Fazier',
		'product directory launch',
		'company page directory',
		'fazier.com',
		'startup directory submission',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'Fazier',
		siteHost: 'fazier.com',
		discoveryFieldsLabel: 'Fazier category and tags',
		autofillDescription:
			'Pick Page, Free product listing, or Paid product listing. The extension opens fazier.com with your profile. Edit fields, then submit on Fazier — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'fazier',
		platformLabel: 'Fazier',
		siteHost: 'fazier.com',
		safariMockContentId: 'directory-site-fazier',
		buildBacklinksSiteSlug: 'fazier',
		siteRulesStepContent:
			'Fazier sets listing, badge, and backlink rules on fazier.com. Skim the policy for your variant before you launch from My Products — OpenQuok autofills, you publish on the site.',
		launchOpportunityStepContent:
			'Fazier offers a company page wizard, a free Basic product launch, and paid Lite Plan or higher tiers. Pick the destination that fits your plan. Confirm dofollow and badge rules on Fazier before you pay.'
	}),
	...buildDirectoryChannelWhoIsFor('Fazier'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Fazier directory launch and extension autofill',
	faqDescription:
		'Company page vs product launch, profile fields, extension handoff, and submission tracking — how OpenQuok supports Fazier today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to Fazier for me?',
			description:
				`No. OpenQuok autofills Fazier wizards from your business profile. You review each page and submit on fazier.com. See ${faqLink(FAZIER_DOCS_PATH, 'Fazier directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on Fazier?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Fill name, tagline, description, website, logo, and social links. Then open Add directory launch → Fazier.`
		},
		{
			title: 'What is the difference between Page and product listing?',
			description:
				`Fazier separates organization profiles (company page at fazier.com/page/new) from product launches (fazier.com/submit). OpenQuok lists Page, Free product listing, and Paid product listing as separate destinations. Details are in ${faqLink(FAZIER_DOCS_PATH, 'Fazier directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about Fazier backlinks?',
			description:
				`OpenQuok also documents Fazier on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/fazier', 'Fazier on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('Fazier directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the fazier.com handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: FAZIER_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;