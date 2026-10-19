/**
 * `/directory-submission-tool` programmatic landing config.
 */
import { icons } from '$data/icons';
import type { IconName } from '$data/icons';

import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import type { FeaturesOrderedStep } from '$lib/content/constants/agents';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import { PUBLIC_LANDING_HERO_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
import {
	faqHrefDocs,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import type { PublicSetupStepsFooter } from '$lib/content/constants/landing/setup-steps-footer';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { ComparisonPoint } from '$lib/ui/templates/WithWithout.svelte';
import { directorySubmissionToolProductFeatureSections } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelFeatureSections';
import { route } from '$lib/utils/path';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';
const directorySubmissionDocsHref = faqHrefDocs('directory-submission');
const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');
const directoryChannelsHubHref = `${route('channels')}#public-directory-channels-hub-heading`;
const buildBacklinksHref = route('build-backlinks');
const pricingHref = publicFaqHref.pricing;
const publicLandingPath = route(getRootPathPublicDirectorySubmissionTool());

export type PublicDirectorySubmissionCta = {
	label: string;
	href: string;
};

export type PublicDirectorySubmissionSectionHeader = {
	subtitle: string;
	title: string;
	description: string;
};

export type PublicDirectorySubmissionPricingRow = {
	id: string;
	model: string;
	typicalCost: string;
	whoSubmits: string;
	whatYouGet: string;
};

export type PublicDirectorySubmissionLinkCardItem = {
	id: string;
	title: string;
	description: string;
	href: string;
	ctaLabel: string;
	iconName: IconName;
};

export type PublicDirectorySubmissionTrustStat = {
	id: string;
	label: string;
	value: string;
};

export type PublicDirectorySubmissionProductFeatureSections =
	import('$lib/content/constants/channels/catalog/directory-platforms/directoryChannelFeatureSections').DirectoryProductFeatureSections;

export type PublicDirectorySubmissionLandingConfig = {
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	hero: PublicDirectorySubmissionSectionHeader & {
		eyebrow: string;
		bullets: readonly string[];
		trustLine: string;
		primaryCta: PublicDirectorySubmissionCta;
		secondaryCta: PublicDirectorySubmissionCta;
	};
	trustStats: readonly PublicDirectorySubmissionTrustStat[];
	whoIsFor: {
		audienceSubtitle: string;
		audienceTitle: string;
		audienceCards: readonly AudienceCard[];
	};
	processSection: PublicDirectorySubmissionSectionHeader & {
		steps: readonly FeaturesOrderedStep[];
		stepsFooter: PublicSetupStepsFooter;
	};
	productFeatureSections: PublicDirectorySubmissionProductFeatureSections;
	compareSection: PublicDirectorySubmissionSectionHeader & {
		withoutTitle: string;
		withTitle: string;
		points: readonly ComparisonPoint[];
	};
	pricingComparisonSection: PublicDirectorySubmissionSectionHeader & {
		footnote: string;
		callout: string;
		rows: readonly PublicDirectorySubmissionPricingRow[];
	};
	featuresGridSection: PublicDirectorySubmissionSectionHeader;
	relatedLinksSection: PublicDirectorySubmissionSectionHeader & {
		items: readonly PublicDirectorySubmissionLinkCardItem[];
	};
	faqSection: {
		faqSubtitle: string;
		faqTitle: string;
		faqDescription: string;
		faqItems: readonly PublicFaqItem[];
	};
	docsBanner: {
		title: string;
		description: string;
		cta: PublicDirectorySubmissionCta;
	};
	softwareApplication: {
		name: string;
		featureList: readonly string[];
		docsPath: string;
	};
};

const tailoredFaqItems: readonly PublicFaqItem[] = [
	{
		title: 'Why not blast 30 directories in one day?',
		description: `Bulk automation can trigger rejections and account flags when many listings appear at once. OpenQuok spreads your work, while you open one directory at a time, review autofilled fields, and submit when it looks right. That human pace protects your brand on PeerPush, Uneed, and the next sites you add. See ${faqLink(directorySubmissionDocsHref, 'directory submission')}.`
	},
	{
		title: 'Do you submit directories for me like a $300 agency?',
		description: `No. OpenQuok is software plus your review — not a done-for-you team. You keep directory logins and approve every form. You avoid agency fees that often start around $300 on public pricing pages while still moving faster than copy-paste alone. Compare workspace plans on ${faqLink(pricingHref, 'pricing')}.`
	},
	{
		title: 'How is this different from cheap “24–48 hour” automation?',
		description: `Fast bulk tools optimize for speed. OpenQuok optimizes for approval safety: one business profile, the ${faqLink(chromeExtensionDocsHref, 'Chrome extension')} for autofill, and steady progress in My Products. You choose which directories to open and when to click submit.`
	},
	{
		title: 'Which directories does OpenQuok support today?',
		description: `PeerPush and Uneed are live directory launch platforms. Each has its own submit flow and paid options on the directory site. OpenQuok does not bundle those listing fees. Browse ${faqLink(directoryChannelsHubHref, 'directory launch platforms')} and ${faqLink(buildBacklinksHref, 'build backlinks')} for research.`
	},
	{
		title: 'Can I reuse the same profile for social scheduling?',
		description: `Yes. Business profiles also feed social channels in the same workspace. Directory launch and social scheduling are separate workflows, but you keep one product story. ${faqLink(publicFaqHref.signUp, 'Sign up for free')} and connect channels from ${faqLink(publicFaqHref.connectChannelsGuide, 'Connect channel')}.`
	}
];

export const PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG: PublicDirectorySubmissionLandingConfig = {
	metaTitle: 'Directory Submission Tool — Human Review, Steady Listings',
	metaDescription:
		'Submit your startup to directory launch sites without bulk-bot risk. One profile, extension autofill, you approve every form, and you pace listings like a human — at workspace pricing, not $300 agency fees.',
	keywords: [
		'directory submission tool',
		'directory submission service',
		'startup directory launch',
		'human directory submissions',
		'product directory autofill',
		'PeerPush submission',
		'Uneed launch',
		'directory submission without spam flags',
		'OpenQuok directory submission'
	],
	hero: {
		subtitle: 'Directory launch',
		eyebrow: '100+ directory targets · you review every form · steady pace',
		title: 'Save hundreds of $\n List your product on launch directories',
		description:
			'Cheap automation ships dozens of listings in a day. Premium agencies charge hundreds. OpenQuok gives you one profile, browser autofill, and you approve each submit on your schedule',
		bullets: [
			'Save days of manual copy-paste across launch forms',
			'Improve SEO with dofollow listings you actually control',
			'You review every field before submit',
			'Pace work over days or weeks to avoid suspicious spikes and penalty from SEO algorithms',
			'Workspace pricing instead of $300+ done-for-you packages'
		],
		trustLine:
			'You keep logins · approve each listing · spread submissions like a human · workspace pricing',
		primaryCta: {
			label: PUBLIC_LANDING_HERO_TRIAL_CTA,
			href: publicFaqHref.signUp
		},
		secondaryCta: {
			label: 'See how the process works',
			href: `${publicLandingPath}#directory-submission-process`
		}
	},
	trustStats: [
		{
			id: 'pace',
			label: 'Your pace',
			value: 'One directory at a time'
		},
		{
			id: 'review',
			label: 'Your review',
			value: 'Approve every form'
		},
		{
			id: 'profile',
			label: 'One profile',
			value: 'Reuse across launches'
		},
		{
			id: 'cost',
			label: 'Typical agency',
			value: '$300+ public pricing'
		}
	],
	whoIsFor: {
		audienceSubtitle: 'Built for founders who care about account safety',
		audienceTitle: 'Who uses human-paced directory launch?',
		audienceCards: [
			{
				iconName: icons.CustomizedDrawnLaptop.name,
				iconClass: 'text-sky-400',
				title: 'Indie founders',
				description:
					'You want backlinks without waking up to mass rejections. You review each listing and spread submits across the week.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.CustomizedDrawnHouse.name,
				iconClass: 'text-amber-400',
				title: 'SaaS teams',
				description:
					'You keep launch copy in one workspace. Marketing approves forms before anything goes live on a directory site.',
				containerClass: CARD_CONTAINER_CLASS
			},
			{
				iconName: icons.Users.name,
				iconClass: 'text-emerald-400',
				title: 'Lean agencies',
				description:
					'You guide clients through directory forms. OpenQuok autofills while clients retain logins and final submit clicks.',
				containerClass: CARD_CONTAINER_CLASS
			}
		]
	},
	processSection: {
		subtitle: 'How it works',
		title: 'Human-paced directory launch',
		description: 'Spread listings over days. You review every form before submit.',
		steps: [
			{
				id: 1,
				title: 'Build one profile',
				content:
					'Add name, tagline, logo, and links in My Products. Fix gaps before you open a directory form.',
				iconName: icons.CustomizedDrawnHouse.name,
				marketingPanel: 'directory-profile-readiness',
				mediaAlt: 'My Products profile with missing field badges'
			},
			{
				id: 2,
				title: 'Pick directories',
				content: 'Choose PeerPush, Uneed, and other sites. Skip where you are already listed.',
				iconName: icons.Globe.name,
				marketingPanel: 'directory-pick-destinations',
				mediaAlt: 'Profile linked to PeerPush and Uneed'
			},
			{
				id: 3,
				title: 'Review autofilled forms',
				content:
					'Open the submit page with the Chrome extension. Edit fields, then submit on the directory site.',
				iconName: icons.BookOpenCheck.name,
				marketingPanel: 'directory-extension-autofill',
				mediaAlt: 'Directory form with autofilled profile fields'
			},
			{
				id: 4,
				title: 'Plan launch timing',
				content:
					'Batch a few launches on one day when a platform’s algo favors momentum (e.g. GitHub). Otherwise spread them across sessions. Each directory sets its own dofollow and eligibility rules — read them before you submit.',
				iconName: icons.Timer.name,
				marketingPanel: 'directory-human-pace',
				mediaAlt: 'Calendar with batched and spaced directory launches'
			},
			{
				id: 5,
				title: 'Track status and URLs',
				content: 'Mark submitted and save each live listing URL in My Products.',
				iconName: icons.ListOrdered.name,
				marketingPanel: 'directory-track-status',
				mediaAlt: 'Submitted status and listing URLs per directory'
			}
		],
		stepsFooter: {
			footerPrompt: 'Picking directories first?',
			footerLinkLabel: 'Open Build backlinks',
			footerLinkHref: buildBacklinksHref
		}
	},
	productFeatureSections: directorySubmissionToolProductFeatureSections,
	compareSection: {
		subtitle: 'Comparisons',
		title: 'steady directory listings, not bulk automation',
		description:
			'Done-for-you blast services move fast. OpenQuok keeps you in the loop — one listing at a time, on your calendar.',
		withoutTitle: 'Bulk directory automation ($150–$300+ campaigns)',
		withTitle: 'OpenQuok — you approve each form',
		points: [
			{
				pain: 'Submitted in few days to weeks',
				feature: 'You pick when to open each site'
			},
			{
				pain: 'Forms filled without you checking every field',
				feature: 'The extension autofills your profile — you edit and submit'
			},
			{
				pain: 'Sudden volume can trigger rejections or flags',
				feature: 'A steady pace looks like a real founder launch'
			},
			{
				pain: 'Status hidden until a vendor sends a report',
				feature: 'Readiness and submitted state live in Dashboard'
			},
			{
				pain: 'Each new launch means buying another campaign',
				feature: 'Reuse the same business profile'
			},
			{
				pain: 'Vendors ask for directory logins and shared passwords',
				feature: 'You keep every login — submit on the site yourself, no password handoff'
			}
		]
	},
	pricingComparisonSection: {
		subtitle: 'Typical costs',
		title: 'Compare submission costs before you buy speed or agency hours',
		description:
			'Public pricing changes. Use this table to choose between fast automation, premium agencies, and a reviewed DIY workflow in OpenQuok.',
		footnote:
			'Automation and agency ranges reflect public one-time package pricing on competitor sites. OpenQuok workspace tiers are on the pricing page. Directory listing fees are not included in OpenQuok.',
		callout:
			'Human-paced launch is slower than overnight bots — that is the point. You trade a few extra days for fewer rejections and accounts you still own.',
		rows: [
			{
				id: 'fast-automation',
				model: 'Fast bulk automation',
				typicalCost: '$150–$300 one-time (public vendor pricing)',
				whoSubmits: 'Vendor scripts / bots',
				whatYouGet: 'Speed-first blast, report when the queue finishes'
			},
			{
				id: 'dfy-agency',
				model: 'Done-for-you agency',
				typicalCost: '$300–$500+ per campaign (public vendor pricing)',
				whoSubmits: 'Human team (sometimes spread over weeks)',
				whatYouGet: 'Hands-off listings, premium price, vendor-owned logins'
			},
			{
				id: 'openquok-reviewed',
				model: 'OpenQuok workspace + extension',
				typicalCost: 'Workspace plan (see pricing) + your review time',
				whoSubmits: 'You — with autofill assist',
				whatYouGet:
					'Profile reuse, you approve every form, human pace, per-site tracking, social scheduling in the same product'
			}
		]
	},
	featuresGridSection: {
		subtitle: 'Supported Channels',
		title: 'Directory launch platforms',
		description:
			'Launch on PeerPush and Uneed from one business profile. OpenQuok autofills each directory form — you review fields and submit on the directory site.',
	},
	relatedLinksSection: {
		subtitle: 'Go deeper',
		title: 'Related guides and catalogs',
		description:
			'Directory launch sits next to backlink research and per-platform integration notes.',
		items: [
			{
				id: 'build-backlinks',
				title: 'Build backlinks',
				description: 'Research dofollow opportunities and listing context before you launch.',
				href: buildBacklinksHref,
				ctaLabel: 'Open catalog →',
				iconName: icons.Link.name
			},
			{
				id: 'directory-channels',
				title: 'Directory launch platforms',
				description: 'PeerPush, Uneed, and future directory channels on the Channels hub.',
				href: directoryChannelsHubHref,
				ctaLabel: 'View platforms →',
				iconName: icons.Globe.name
			},
			{
				id: 'chrome-extension',
				title: 'Chrome extension install',
				description: 'Install and pin the extension before your first autofill launch.',
				href: chromeExtensionDocsHref,
				ctaLabel: 'Install extension →',
				iconName: icons.CustomizedDrawnLaptop.name
			}
		]
	},
	faqSection: {
		faqSubtitle: 'Directory submission tool',
		faqTitle: 'Questions about human-paced directory launch',
		faqDescription:
			'Why we favor your review and a steady pace over overnight bulk automation — and how OpenQuok supports that workflow.',
		faqItems: appendPublicGeneralFaqItems(tailoredFaqItems, PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS)
	},
	docsBanner: {
		title: 'Read the directory submission guide',
		description:
			'Profile fields, extension handoff, PeerPush and Uneed variants, pacing tips, and how to mark launches complete.',
		cta: {
			label: 'Open directory submission docs',
			href: directorySubmissionDocsHref
		}
	},
	softwareApplication: {
		name: 'OpenQuok Directory Submission Tool',
		docsPath: directorySubmissionDocsHref,
		featureList: [
			'Business profile reuse across directory forms',
			'Browser extension autofill with founder review on every submit',
			'Human-paced launch — you choose when each directory goes live',
			'Readiness checks before opening a directory form',
			'Per-destination submission tracking in My Products',
			'Directory launch platforms including PeerPush and Uneed'
		]
	}
};

/** Canonical path segment for SEO loads (`customSlug`). */
export const PUBLIC_DIRECTORY_SUBMISSION_LANDING_SLUG = getRootPathPublicDirectorySubmissionTool();

/** Resolved root-relative path (`/directory-submission-tool`). */
export const PUBLIC_DIRECTORY_SUBMISSION_LANDING_PATH = publicLandingPath;
