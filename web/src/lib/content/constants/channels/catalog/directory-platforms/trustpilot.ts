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

const TRUSTPILOT_DOCS_PATH = '/docs/directory-integration/trustpilot';

export const trustpilotDirectoryChannel = {
	slug: 'trustpilot',
	platformId: 'trustpilot',
	platformLabel: 'Trustpilot',
	icon: icons.Trustpilot.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'trustpilot',
	heroTitle: buildDirectoryChannelHeroTitle('Trustpilot'),
	heroDescription: buildDirectoryChannelHeroDescription(
		'Trustpilot',
		'businessapp.b2b.trustpilot.com'
	),
	metaTitle: 'Trustpilot Company Profile — Business Review Directory',
	metaDescription:
		'Claim your Trustpilot company profile with OpenQuok. Autofill company settings from your business profile, track submissions, and verify and publish on Trustpilot yourself.',
	hubDescription:
		'Autofill Trustpilot Business company settings from your business profile. You verify with a business email and publish on Trustpilot.',
	keywords: [
		'Trustpilot',
		'company profile',
		'review site',
		'business reputation',
		'nofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'Trustpilot',
		siteHost: 'businessapp.b2b.trustpilot.com',
		discoveryFieldsLabel: 'Trustpilot company name, domain, and description',
		autofillDescription:
			'Open company profile in one dashboard. The extension opens businessapp.b2b.trustpilot.com/company-settings/ with your profile. You verify domain and business email, complete contact info, and publish on Trustpilot.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'trustpilot',
		platformLabel: 'Trustpilot',
		siteHost: 'businessapp.b2b.trustpilot.com',
		safariMockContentId: 'directory-site-trustpilot',
		buildBacklinksSiteSlug: 'trustpilot',
		siteRulesStepContent:
			'Trustpilot requires a verifiable business email on your company domain to claim the profile. Profile links to your website are typically nofollow — confirm rel on the live page after publish. Skim Trustpilot Business help before you launch from My Products.',
		launchOpportunityStepContent:
			'OpenQuok autofills company name, domain, description, and logo. Contact info, Save and publish, and email verification stay manual on Trustpilot Business.'
	}),
	...buildDirectoryChannelWhoIsFor('Trustpilot'),
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Trustpilot directory launch and extension autofill',
	faqDescription:
		'Business login, business email verification, nofollow links, profile fields, and submission tracking — how OpenQuok supports Trustpilot today.',
	faqItems: [
		{
			title: 'Does OpenQuok submit to Trustpilot for me?',
			description:
				`No. OpenQuok autofills Trustpilot Business company settings from your business profile. You verify, complete contact info, and publish on Trustpilot yourself. See ${faqLink(TRUSTPILOT_DOCS_PATH, 'Trustpilot directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'What do I need before I launch on Trustpilot?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the OpenQuok browser extension from ${faqLinkChromeWebStore()} (${faqLink(faqHrefDocs('installation/chrome-extension'), 'install guide')} or ${faqLink(publicFaqHref.browserExtensionLanding, 'product overview')}), and create a product in My Products. Sign in to Trustpilot Business, use a business email on your domain for verification, then open Add directory launch → Trustpilot.`
		},
		{
			title: 'Are Trustpilot profile links dofollow?',
			description:
				`Public Trustpilot company profiles often link to your site with nofollow. OpenQuok labels the opportunity accordingly on Build backlinks. Confirm rel on your live profile after publish. See ${faqLink('/build-backlinks/trustpilot', 'Trustpilot on Build backlinks')}.`
		},
		{
			title: 'Which fields does OpenQuok autofill on Trustpilot?',
			description:
				`OpenQuok fills company name, website domain, description, and logo on company settings. Contact info and Save and publish stay manual. Details are in ${faqLink(TRUSTPILOT_DOCS_PATH, 'Trustpilot directory integration')}.`
		},
		{
			title: buildChannelProgrammaticDirectoryLaunchFaqTitle('Trustpilot directory launches'),
			description: buildChannelProgrammaticDirectoryLaunchFaqDescription({
				preparePhrase:
					'Create a product profile in your dashboard and install the OpenQuok browser extension for the Trustpilot Business handoff',
				cliExamplesHref: faqHrefDocs('cli-usages/directory-launch'),
				cliExamplesLabel: 'Directory launch CLI',
				suffix:
					'Directory SEO metrics are cached — read checkedAt and manualRefreshAvailableAt in API or CLI responses.'
			})
		}
	],
	docsPath: TRUSTPILOT_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;