import { icons } from '$data/icons';

import { buildDirectoryChannelFeatureSections } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelFeatureSections';
import { buildDirectoryChannelProcessSection } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelProcessSection';
import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
	faqHrefDocs,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const UNEED_DOCS_PATH = '/docs/directory-integration/uneed';

export const uneedDirectoryChannel = {
	slug: 'uneed',
	platformId: 'uneed',
	platformLabel: 'Uneed',
	icon: icons.Uneed.name,
	channelKind: 'directory',
	buildBacklinksSiteSlug: 'uneed',
	heroTitle: 'Launch on Uneed with your OpenQuok business profile',
	heroDescription:
		'Keep one product profile in OpenQuok. Launch Join the line, paid launch, or maker profile flows from My Products. The extension autofills uneed.best. You submit on Uneed when the form looks right.',
	metaTitle: 'Uneed Directory Launch — Product Launch & Startup Listing',
	metaDescription:
		'Submit your product to Uneed with OpenQuok. Reuse your business profile, autofill Uneed launch forms with the browser extension, and track readiness. You approve each submit on uneed.best.',
	hubDescription:
		'Autofill Uneed Join the line, paid launch, and maker profile from your business profile. You submit on uneed.best.',
	keywords: [
		'Uneed',
		'startup directory submission',
		'product directory launch',
		'Uneed launch',
		'join the line Uneed',
		'product launch directory',
		'dofollow backlink',
		'OpenQuok directory launch'
	],
	featureSections: buildDirectoryChannelFeatureSections({
		platformLabel: 'Uneed',
		discoveryFieldsLabel: 'Uneed pricing and maker fields',
		autofillDescription:
			'Pick Join the line, paid launch, or maker profile in My Products. The extension opens uneed.best with your profile. Edit fields, then submit on Uneed.'
	}),
	processSection: buildDirectoryChannelProcessSection({
		channelSlug: 'uneed',
		platformLabel: 'Uneed',
		siteHost: 'uneed.best',
		safariMockContentId: 'directory-site-uneed',
		buildBacklinksSiteSlug: 'uneed',
		siteRulesStepContent:
			'Uneed sets backlink and listing rules per flow on uneed.best. Skim the policy for your variant before you launch from My Products — OpenQuok autofills, you publish on Uneed.',
		launchOpportunityStepContent:
			'Choose Join the line (free wait), a paid launch slot, or maker profile in My Products. Each path has different timing and dofollow terms — pick what matches your goals, then confirm details on Uneed.'
	}),
	audienceSubtitle: 'Built for product makers',
	audienceTitle: 'Who launches on Uneed with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-violet-400',
			title: 'Indie hackers',
			description:
				'Line up Uneed launches without re-entering the same pitch on every pricing page.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-rose-400',
			title: 'Micro-SaaS teams',
			description:
				'Track Join the line and paid launch separately while sharing one business profile.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-cyan-400',
			title: 'Launch coordinators',
			description:
				'Prefill Uneed forms for a founder review. They still click publish on uneed.best.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
	faqSubtitle: 'Frequently asked questions',
	faqTitle: 'Uneed directory launch and extension autofill',
	faqDescription:
		'Join the line vs paid launch, profile fields, extension handoff, and submission tracking — how OpenQuok supports Uneed today.',
	faqItems: [
		{
			title: 'Does OpenQuok post my product to Uneed automatically?',
			description:
				`No. OpenQuok fills Uneed forms from your business profile. You review and submit on uneed.best. See ${faqLink(UNEED_DOCS_PATH, 'Uneed directory integration')} and ${faqLink(faqHrefDocs('directory-submission'), 'directory submission')}.`
		},
		{
			title: 'Which Uneed launch paths does OpenQuok support?',
			description:
				`OpenQuok ships separate destinations for Join the line, paid launch, and maker profile when they are published in the auto-launch catalog. Each has its own start URL and extension config. Compare variants in ${faqLink(UNEED_DOCS_PATH, 'Uneed directory integration')}.`
		},
		{
			title: 'What should I prepare in My Products first?',
			description:
				`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, install the ${faqLink(faqHrefDocs('installation/chrome-extension'), 'OpenQuok browser extension')}, and complete the product profile fields Uneed expects — name, tagline, description, website, logo, and discovery tags. The readiness panel lists anything still missing.`
		},
		{
			title: 'Where can I read Uneed backlink and cost notes?',
			description:
				`Editorial catalog pages cover dofollow and pricing context. See ${faqLink('/build-backlinks/uneed', 'Uneed on Build backlinks')} and the ${faqLink('/channels#public-directory-channels-hub-heading', 'directory launch platforms')} hub section.`
		}
	],
	docsPath: UNEED_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
