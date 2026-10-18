import { icons } from '$data/icons';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';
import {
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
	heroTitle: 'Launch on PeerPush with your OpenQuok business profile',
	heroDescription:
		'Build one product profile in OpenQuok. Launch Standard launch or the free queue from My Products. The browser extension autofills peerpush.com. You review each field and submit on PeerPush.',
	metaTitle: 'PeerPush Directory Launch — Startup Listing & Product Launch',
	metaDescription:
		'Submit your startup to PeerPush with OpenQuok. Reuse your business profile, autofill the PeerPush submit form with the extension, and track listing readiness. You control each publish on peerpush.com.',
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
	featureSections: [
		{
			subtitle: 'Business profile',
			title: 'One product profile, name, tagline, logo, and discovery fields',
			description:
				'Store your product name, tagline, description, website, logo, and PeerPush categories in My Products. OpenQuok checks readiness before you launch. Fix missing fields in the composer instead of retyping on every directory.',
			mediaOnRight: true
		},
		{
			subtitle: 'Extension autofill',
			title: 'Open PeerPush submit, autofill from your profile, you approve each field',
			description:
				'Choose Standard launch or the free queue from the directory launch picker. OpenQuok opens peerpush.com with the extension. Fields map from your profile. You edit anything on the page and click submit on PeerPush.',
			mediaOnRight: false
		},
		{
			subtitle: 'Track submissions',
			title: 'Mark submitted, save listing URL, see progress on My Products',
			description:
				'After you publish on PeerPush, mark the launch complete in OpenQuok. Add the live listing URL when you have it. Cards show readiness and submitted counts per destination variant.',
			mediaOnRight: true
		}
	],
	audienceSubtitle: 'Built for indie founders',
	audienceTitle: 'Who launches on PeerPush with OpenQuok?',
	audienceCards: [
		{
			iconName: icons.CustomizedDrawnLaptop.name,
			iconClass: 'text-sky-400',
			title: 'Solo founders',
			description:
				'Ship a launch on PeerPush without copying the same pitch into every form field.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnHouse.name,
			iconClass: 'text-amber-400',
			title: 'Small product teams',
			description:
				'Keep one canonical profile for PeerPush variants and future directory launches.',
			containerClass: 'h-full min-h-[18rem]'
		},
		{
			iconName: icons.CustomizedDrawnRobot.name,
			iconClass: 'text-emerald-400',
			title: 'Launch marketers',
			description:
				'Hand off a filled PeerPush form to a teammate. They still submit from their browser.',
			containerClass: 'h-full min-h-[18rem]'
		}
	],
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
		}
	],
	docsPath: PEERPUSH_DOCS_PATH,
	available: true
} satisfies PublicChannelLandingPageViewModel;
