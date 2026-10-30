/**
 * Directory launch (auto-launch) providers: one content-script bundle per `provider_slug`,
 * registered in the extension manifest. Cookie-session channels stay in `cookieSessionProviders.ts`.
 */

import { directorySiteKeyFromProviderSlug } from '../auto-launch/directorySiteKey.js';

/** Mirrors `auto_launch_destinations.extension_config` (API / seeds). */
export type AutoLaunchExtensionConfig = {
	version?: number;
	startUrlPatterns?: readonly string[];
	readyUrlHint?: string;
	steps?: LaunchStep[];
	proof?: Record<string, unknown>;
};

/** How the extension fill engine should set a destination form control (default `text`). */
export const LAUNCH_STEP_FIELD_FILL_MODES = [
	'text',
	'select',
	'boolean',
	'rich_html',
	'tags',
	'file',
	'files',
] as const;
export type LaunchStepFieldFillMode = (typeof LAUNCH_STEP_FIELD_FILL_MODES)[number];

export type LaunchStepField = {
	key: string;
	label: string;
	profilePath: string;
	selectorHint?: string;
	fillMode?: LaunchStepFieldFillMode;
	/** When several `input[type=file]` match, pick by index (default 0). */
	fileInputIndex?: number;
};

export type LaunchStep = {
	id: string;
	label: string;
	fields?: LaunchStepField[];
};

/** Profile fields captured at submission intent time (snake_case matches API snapshot). */
export type AutoLaunchProfileSnapshot = {
	name: string;
	tagline: string | null;
	description: string | null;
	website_url: string | null;
	logo_url: string | null;
	profile_data: Record<string, unknown>;
	integration_customer_id: string | null;
};

export type FieldFillStatus = 'found' | 'not_found' | 'not_in_profile' | 'skipped' | 'error';

export type FieldFillResult = {
	key: string;
	label?: string;
	status: FieldFillStatus;
	message?: string;
};

/** Short paid vs free label for extension directory channel chips (matches link-directory `cost_tier`). */
export type DirectoryLaunchTierLabel = 'Free' | 'Paid';

export interface DirectoryLaunchProvider {
	/** Matches `auto_launch_destinations.provider_slug`. */
	identifier: string;
	/** Human label for popup / diagnostics. */
	name: string;
	/** Shown on the extension Directory tab channel avatar (top-right). */
	tierLabel: DirectoryLaunchTierLabel;
	/** Default entry URL when opening the directory from the extension popup. */
	defaultStartUrl: string;
	/** Built script path under `extension/dist/` (manifest `content_scripts[].js`). */
	contentScriptEntry: string;
	/** Manifest `content_scripts[].matches` entries for this provider. */
	hostPatterns: readonly string[];
	/** Manifest `host_permissions` entry (e.g. `*://*.example.com/*`). */
	hostPermission: string;
}

const UNEED_HOST_PATTERNS: readonly string[] = [
	'https://uneed.best/*',
	'https://www.uneed.best/*',
];

const UNEED_HOST_PERMISSION = '*://*.uneed.best/*';

const UNEED_JOIN_LINE: DirectoryLaunchProvider = {
	identifier: 'uneed-join-line',
	name: 'Uneed — Join the line',
	tierLabel: 'Free',
	defaultStartUrl: 'https://uneed.best/pricing',
	contentScriptEntry: 'content/directory-launch/openquok-directory-uneed.js',
	hostPatterns: UNEED_HOST_PATTERNS,
	hostPermission: UNEED_HOST_PERMISSION,
};

const UNEED_PAID_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'uneed-paid-launch',
	name: 'Uneed — Paid launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://uneed.best/pricing',
	contentScriptEntry: 'content/directory-launch/openquok-directory-uneed.js',
	hostPatterns: UNEED_HOST_PATTERNS,
	hostPermission: UNEED_HOST_PERMISSION,
};

const UNEED_MAKER_PROFILE: DirectoryLaunchProvider = {
	identifier: 'uneed-maker-profile',
	name: 'Uneed — Maker profile',
	tierLabel: 'Free',
	defaultStartUrl: 'https://uneed.best/profile',
	contentScriptEntry: 'content/directory-launch/openquok-directory-uneed.js',
	hostPatterns: UNEED_HOST_PATTERNS,
	hostPermission: UNEED_HOST_PERMISSION,
};

const PEERPUSH_HOST_PATTERNS: readonly string[] = [
	'https://peerpush.com/*',
	'https://www.peerpush.com/*',
];

const PEERPUSH_HOST_PERMISSION = '*://*.peerpush.com/*';

const PEERPUSH_STANDARD_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'peerpush-standard-launch',
	name: 'PeerPush — Standard launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://peerpush.com/submit',
	contentScriptEntry: 'content/directory-launch/openquok-directory-peerpush.js',
	hostPatterns: PEERPUSH_HOST_PATTERNS,
	hostPermission: PEERPUSH_HOST_PERMISSION,
};

const PEERPUSH_FREE_QUEUE: DirectoryLaunchProvider = {
	identifier: 'peerpush-free-queue',
	name: 'PeerPush — Free queue',
	tierLabel: 'Free',
	defaultStartUrl: 'https://peerpush.com/pricing',
	contentScriptEntry: 'content/directory-launch/openquok-directory-peerpush.js',
	hostPatterns: PEERPUSH_HOST_PATTERNS,
	hostPermission: PEERPUSH_HOST_PERMISSION,
};

/** Registered directory launch destinations (extension manifest mirrors this list). */
export const directoryLaunchProviders: readonly DirectoryLaunchProvider[] = [
	UNEED_JOIN_LINE,
	UNEED_PAID_LAUNCH,
	UNEED_MAKER_PROFILE,
	PEERPUSH_FREE_QUEUE,
	PEERPUSH_STANDARD_LAUNCH,
];

const providersById = new Map<string, DirectoryLaunchProvider>(
	directoryLaunchProviders.map((provider) => [provider.identifier, provider])
);

export function getDirectoryLaunchProvider(
	identifier: string
): DirectoryLaunchProvider | undefined {
	return providersById.get(identifier);
}

export function isDirectoryLaunchProviderId(identifier: string): boolean {
	return providersById.has(identifier);
}

export function listDirectoryLaunchProviderSummaries(): {
	identifier: string;
	name: string;
	tierLabel: DirectoryLaunchTierLabel;
}[] {
	return directoryLaunchProviders.map(({ identifier, name, tierLabel }) => ({
		identifier,
		name,
		tierLabel,
	}));
}

function normalizeDirectoryLaunchHostname(hostname: string): string {
	const trimmed = hostname.trim().toLowerCase();
	return trimmed.startsWith('www.') ? trimmed.slice(4) : trimmed;
}

function hostnameFromDirectoryLaunchHostPattern(pattern: string): string | null {
	const match = /^https?:\/\/([^/*]+)/i.exec(pattern);
	return match ? normalizeDirectoryLaunchHostname(match[1]) : null;
}

const directoryLaunchSiteKeyByHostname = (() => {
	const map = new Map<string, string>();
	for (const provider of directoryLaunchProviders) {
		const siteKey = directorySiteKeyFromProviderSlug(provider.identifier);
		for (const pattern of provider.hostPatterns) {
			const host = hostnameFromDirectoryLaunchHostPattern(pattern);
			if (host) {
				map.set(host, siteKey);
			}
		}
	}
	return map;
})();

/** Deduped manifest `content_scripts[].matches` entries across all directory launch providers. */
export function getDirectoryLaunchUniqueHostPatterns(): readonly string[] {
	const seen = new Set<string>();
	const patterns: string[] = [];
	for (const provider of directoryLaunchProviders) {
		for (const pattern of provider.hostPatterns) {
			if (seen.has(pattern)) {
				continue;
			}
			seen.add(pattern);
			patterns.push(pattern);
		}
	}
	return patterns;
}

/**
 * Maps a page hostname to a directory site key (`link_directory_sites.slug`), e.g. `peerpush.com` → `peerpush`.
 * Returns `undefined` when the host is not registered in `directoryLaunchProviders`.
 */
export function getDirectoryLaunchSiteKeyFromLocation(hostname: string): string | undefined {
	const normalized = normalizeDirectoryLaunchHostname(hostname);
	return directoryLaunchSiteKeyByHostname.get(normalized);
}

/** Payload stored in the extension after dashboard handoff (`AUTO_LAUNCH_HANDOFF`). */
export type AutoLaunchHandoffSession = {
	submissionId: string;
	launchToken: string;
	providerSlug: string;
	startUrl: string;
	profileSnapshotHash?: string;
	profileSnapshot: AutoLaunchProfileSnapshot;
	extensionConfig: AutoLaunchExtensionConfig;
};

export type AutoLaunchProgressPayload = {
	providerSlug: string;
	stepId: string;
	stepLabel?: string;
	stepIndex?: number;
	stepCount?: number;
	filledCount: number;
	totalFields: number;
	fieldResults?: FieldFillResult[];
	errors?: string[];
};

export type AutoLaunchCompletePayload = {
	submissionId: string;
	success: boolean;
	listingUrl?: string;
	error?: string;
};
