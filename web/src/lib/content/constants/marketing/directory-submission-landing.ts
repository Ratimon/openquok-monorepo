/**
 * `/directory-submission-tool` programmatic landing config.
 */
import { icons } from '$data/icons';
import type { IconName } from '$data/icons';

import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';
import type { FeaturesOrderedStep } from '$lib/content/constants/agents';
import { PUBLIC_DIRECTORY_SUBMISSION_LANDING_FAQ_SECTION } from '$lib/content/constants/faq/marketing/directory-submission';
import type { PublicMarketingLandingFaqSection } from '$lib/content/constants/faq/marketing/types';
import { PUBLIC_LANDING_HERO_TRIAL_CTA } from '$lib/content/constants/landing/hero-copy';
import {
	faqHrefDocs,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';
import type { PublicSetupStepsFooter } from '$lib/content/constants/landing/setup-steps-footer';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import type { ComparisonPoint } from '$lib/ui/templates/WithWithout.svelte';
import type { PublicLandingHeroStatBadge } from '$lib/content/constants/marketing/publicLandingHeroStatBadges';
import { route } from '$lib/utils/path';

const CARD_CONTAINER_CLASS = 'h-full min-h-[18rem]';
const directorySubmissionDocsHref = faqHrefDocs('directory-submission');
const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');
const directoryChannelsHubHref = `${route('channels')}#public-directory-channels-hub-heading`;
const buildBacklinksHref = route('build-backlinks');
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

export type PublicDirectorySubmissionTrustStat = PublicLandingHeroStatBadge;

export type PublicDirectorySubmissionProductFeatureSections = {
	feature1: PublicDirectorySubmissionSectionHeader;
	feature2: PublicDirectorySubmissionSectionHeader;
	feature3: PublicDirectorySubmissionSectionHeader;
	feature4: PublicDirectorySubmissionSectionHeader;
	feature5: PublicDirectorySubmissionSectionHeader;
};

export type PublicDirectorySubmissionLandingConfig = {
	metaTitle: string;
	metaDescription: string;
	keywords: readonly string[];
	hero: PublicDirectorySubmissionSectionHeader & {
		bullets: readonly string[];
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
	faqSection: PublicMarketingLandingFaqSection;
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

export const PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG: PublicDirectorySubmissionLandingConfig = {
	metaTitle: 'Directory Submission Tool — DR Growth & Human-Paced Launch',
	metaDescription:
		'Grow domain rating and backlinks from directory launches without bulk-bot risk. One profile, extension autofill, DR analytics, and you approve every listing — workspace pricing, not $300 agency fees.',
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
		subtitle: '',
		title: 'Launch your startup on directories in days not weeks',
		description:
			'Directory listings build backlinks and authority when you pace them like a human. OpenQuok autofills launch forms, tracks domain rating in your workspace, and keeps you in control of every submit.',
		bullets: [
			'Move from low DR by +15 AVG DR within 30 days',
			'Save days of manual copy-paste across launch forms',
			'Keep and own your login credentials',
			'Reach buyers on Google, directories, and AI suggestions',
			'You spread submissions like a human — No AI-powered automation, leading to penalty from Searh Engine',
			'Save $300+ by yourself unlike other agency packages'
		],
		primaryCta: {
			label: PUBLIC_LANDING_HERO_TRIAL_CTA,
			href: publicFaqHref.signUp
		},
		secondaryCta: {
			label: 'How it works',
			href: `${publicLandingPath}#directory-submission-process`
		}
	},
	trustStats: [
		{
			id: 'pick-directories',
			value: 'Your picks',
			label: 'Curated catalog'
		},
		{
			id: 'workspace',
			value: 'Team seats',
			label: 'Shared workspace'
		},
		{
			id: 'dashboard',
			value: 'Full control',
			label: 'One dashboard'
		},
		{
			id: 'dr-tracking',
			value: 'More visibility',
			label: 'Backlinks and traffic'
		}
	],
	whoIsFor: {
		audienceSubtitle: 'For founders in the AI era',
		audienceTitle: 'Who gets found on Google, directories, and LLMs?',
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
				title: 'Marketing teams',
				description:
					'You coordinate directory launches across sites. OpenQuok autofills from one profile — your team reviews each form and submits on the directory.',
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
					'Add name, description, logo, screenshot, and social links in one place. Fix gaps before you open a directory form.',
				iconName: icons.CustomizedDrawnHouse.name,
				marketingPanel: 'directory-profile-readiness',
				mediaAlt: 'Profile with missing field badges'
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
					'Batch a few launches on one day when a platform’s algo favors momentum (e.g. GitHub). Otherwise spread them across sessions. Each directory sets its own dofollow rules.',
				iconName: icons.Timer.name,
				marketingPanel: 'directory-human-pace',
				mediaAlt: 'Calendar with batched and spaced directory launches'
			},
			{
				id: 5,
				title: 'Track status and URLs',
				content: 'Mark submitted and save each live listing URL in one dashboard.',
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
	productFeatureSections: {
		feature1: {
			subtitle: 'Pick directories',
			title: 'Submit only directories that matter and skip the rest',
			description:
				'Research launch sites in our curated catalog. Explore real traffic and domain authority, not spam lists. You open only the directories you want. No forced campaign bundle.'
		},
		feature2: {
			subtitle: 'Workspaces and team',
			title: 'Invite by email, assign Member, manage seats by Admin',
			description:
				'Add Members by email. Admins manage seats. Everyone shares profiles and launch status in one dashboard.'
		},
		feature3: {
			subtitle: 'Full dashboard control',
			title: 'Manage your listing in one place tweak each listing efficiently',
			description:
				'Edit name, description, screenshots, and links in one dashboard. Tailor tags or pricing per site. Changes sync to pending launches. Track real-time progress.'
		},
		feature4: {
			subtitle: 'Built-in DR tracking',
			title: 'Track DR moves, compare rivals, adapt your launch plan',
			description:
				'Monitor domain rating history for your product site, add competitor domains, and see trends next to the listings you submitted in one dashboard — so you know what is working.'
		},
		feature5: {
			subtitle: 'Real traffic growth',
			title: 'Grow more organic traffic, track clicks and impressions, pivot correctly',
			description:
				'Search Console totals and trends next to your launches. See when steady directory submits turn into more visits — not just backlinks on a spreadsheet.'
		}
	},
	compareSection: {
		subtitle: 'Comparisons',
		title: 'steady directory submissions, not bulk automation',
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
				pain: 'Forms filled without you checking',
				feature: 'The extension autofills your listing — you edit and submit'
			},
			{
				pain: 'Sudden volume can trigger rejections or flags',
				feature: 'A steady pace looks like a real founder launch'
			},
			{
				pain: 'Status hidden until a vendor sends a report',
				feature: 'Readiness and status live in Dashboard'
			},
			{
				pain: 'Each new launch means buying another campaign',
				feature: 'Reuse the same editable business profile'
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
				typicalCost: '$150–$300 one-time',
				whoSubmits: 'Vendor scripts / bots',
				whatYouGet: 'Speed-first blast, report when the queue finishes'
			},
			{
				id: 'dfy-agency',
				model: 'Done-for-you agency',
				typicalCost: '$300–$500+ per campaign',
				whoSubmits: 'Human team (sometimes spread over weeks)',
				whatYouGet: 'Hands-off listings, premium price, vendor-owned logins'
			},
			{
				id: 'openquok-reviewed',
				model: 'OpenQuok workspace + extension',
				typicalCost: 'Workspace plan (see pricing)',
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
	faqSection: PUBLIC_DIRECTORY_SUBMISSION_LANDING_FAQ_SECTION,
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
			'Per-destination submission tracking in one dashboard',
			'Directory launch platforms including PeerPush and Uneed'
		]
	}
};

/** Canonical path segment for SEO loads (`customSlug`). */
export const PUBLIC_DIRECTORY_SUBMISSION_LANDING_SLUG = getRootPathPublicDirectorySubmissionTool();

/** Resolved root-relative path (`/directory-submission-tool`). */
export const PUBLIC_DIRECTORY_SUBMISSION_LANDING_PATH = publicLandingPath;
