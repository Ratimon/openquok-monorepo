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

const INDIEHUB_DOCS_PATH = '/docs/directory-integration/indiehub';

export const indiehubDirectoryChannel = {
	slug: 'indiehub',
	platformId: 'indiehub',
	platformLabel: 'IndieHub',
	icon: icons.IndieHub.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'indiehub',
	heroTitle: buildDirectoryChannelHeroTitle('IndieHub'),
	heroDescription: buildDirectoryChannelHeroDescription('IndieHub', 'indiehub.best'),
	metaTitle: 'IndieHub Listing — Indie Product Directory Launch',
	metaDescription:
		'Launch on IndieHub with OpenQuok. Autofill the submit wizard Details step, track submissions, and publish on indiehub.best yourself.',
	hubDescription:
		'Autofill IndieHub Basic and Pro listings from your business profile. You pay and publish on indiehub.best.',
	keywords: [
		'IndieHub',
		'indie product directory',
		'startup launch',
		'indiehub.best',
		'dofollow backlink',
		'product listing',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'IndieHub',
		siteHost: 'indiehub.best',
		discoveryFieldsLabel: 'IndieHub categories and discovery tags',
		autofillDescription:
			'Pick Basic or Pro in one dashboard. The extension opens indiehub.best/submit with your profile. Edit fields on step 1 (Details), then pay and publish on IndieHub — and reuse the same profile on other directories you choose.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'indiehub',
		platformLabel: 'IndieHub',
		siteHost: 'indiehub.best',
		safariMockContentId: 'directory-site-indiehub',
		buildBacklinksSiteSlug: 'indiehub',
		siteRulesStepContent:
			'IndieHub lists indie products with paid Basic and Pro tiers and dofollow links. Skim pricing on indiehub.best/pricing before you launch from My Products — OpenQuok autofills step 1 only; Payment and Publish stay on the site.',
		launchOpportunityStepContent:
			'Choose Basic ($4.9) or Pro ($9.9) when you add the destination. OpenQuok fills the Details form; you pick the plan, pay with Stripe on step 2, and publish on step 3.'
	}),
	...buildDirectoryChannelWhoIsFor('IndieHub'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'IndieHub directory launch and extension autofill',
	faqDescription:
		'Basic vs Pro, profile fields, extension handoff, payment wizard, and submission tracking — how OpenQuok supports IndieHub today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to IndieHub for me?',
			description:
				`No. OpenQuok autofills indiehub.best/submit step 1 (Details) from your business profile. You review the page, pay on step 2, and publish on step 3 yourself. See ${faqLink(INDIEHUB_DOCS_PATH, 'IndieHub directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on IndieHub?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Fill name, tagline, long description, website, logo, one cover image, categories, and tags. Then open Add directory launch → IndieHub.`
		},
		{
			title: 'What is the difference between Basic and Pro on IndieHub?',
			description:
				`Both paths share the same Details form on /submit. Basic and Pro differ in placement and pricing on IndieHub (see indiehub.best/pricing). OpenQuok lists each tier as its own destination so readiness and submission counts stay separate. Checkout on step 2 (Payment) stays manual. Details are in ${faqLink(INDIEHUB_DOCS_PATH, 'IndieHub directory integration')}.`
		},
		{
			title: 'Where can I read editorial notes about IndieHub backlinks?',
			description:
				`OpenQuok documents IndieHub on the build backlinks catalog for dofollow and cost context. See ${faqLink('/build-backlinks/indiehub', 'IndieHub on Build backlinks')} and ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('IndieHub directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the indiehub.best handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: INDIEHUB_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;