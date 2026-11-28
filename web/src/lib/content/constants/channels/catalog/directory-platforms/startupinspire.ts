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

const STARTUPINSPIRE_DOCS_PATH = '/docs/directory-integration/startupinspire';

export const startupinspireDirectoryChannel = {
	slug: 'startupinspire',
	platformId: 'startupinspire',
	platformLabel: 'StartupInspire',
	icon: icons.StartupInspire.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'startupinspire',
	heroTitle: buildDirectoryChannelHeroTitle('StartupInspire'),
	heroDescription: buildDirectoryChannelHeroDescription('StartupInspire', 'startupinspire.com'),
	metaTitle: 'StartupInspire Listing — Startup Directory & Launch Platform',
	metaDescription:
		'List your startup on StartupInspire with OpenQuok. Autofill the dashboard create form, track free and Starter launches, and publish on startupinspire.com yourself.',
	hubDescription:
		'Autofill StartupInspire free listing and Starter launch from your business profile. You submit on startupinspire.com.',
	keywords: [
		'StartupInspire',
		'startup directory',
		'product launch platform',
		'startupinspire.com',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'StartupInspire',
		siteHost: 'startupinspire.com',
		discoveryFieldsLabel: 'StartupInspire technology or category',
		autofillDescription:
			'Pick free listing or Starter launch. The extension opens startupinspire.com with your profile. Edit fields, then submit on StartupInspire — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'startupinspire',
		platformLabel: 'StartupInspire',
		siteHost: 'startupinspire.com',
		safariMockContentId: 'directory-site-startupinspire',
		buildBacklinksSiteSlug: 'startupinspire',
		siteRulesStepContent:
			'StartupInspire offers a free tier with manual review and a paid Starter path with instant approval. Skim pricing and FAQ on startupinspire.com before you launch from My Products — OpenQuok autofills, you publish on the site.',
		launchOpportunityStepContent:
			'Free listing starts on the pricing page; Starter launch opens the dashboard create form. Checkout, social links, reCAPTCHA, and final publish stay manual on StartupInspire. Confirm rel on your live `/startup/{slug}` page after publish.'
	}),
	...buildDirectoryChannelWhoIsFor('StartupInspire'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'StartupInspire directory launch and extension autofill',
	faqDescription:
		'Free listing vs Starter launch, profile fields, extension handoff, dofollow links, and submission tracking — how OpenQuok supports StartupInspire today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to StartupInspire for me?',
			description:
				`No. OpenQuok autofills the StartupInspire startup create form from your business profile. You review the page and submit on startupinspire.com. See ${faqLink(STARTUPINSPIRE_DOCS_PATH, 'StartupInspire directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on StartupInspire?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Sign in on StartupInspire, then open Add directory launch → StartupInspire.`
		},
		{
			title: 'What is the difference between free listing and Starter launch?',
			description:
				`Free listing starts on https://www.startupinspire.com/pricing and uses manual review (typically a few business days). Starter launch is a one-time paid tier with instant approval after checkout. OpenQuok lists each as a separate destination. Details are in ${faqLink(STARTUPINSPIRE_DOCS_PATH, 'StartupInspire directory integration')}.`
		},
		{
			title: 'Are StartupInspire profile links dofollow?',
			description:
				`Public StartupInspire startup pages often link to your website without nofollow on the primary website button. OpenQuok labels both opportunities as dofollow on Build backlinks. Confirm rel on your live /startup/slug page after publish. See ${faqLink('/build-backlinks/startupinspire', 'StartupInspire on Build backlinks')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('StartupInspire directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the startupinspire.com handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: STARTUPINSPIRE_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;