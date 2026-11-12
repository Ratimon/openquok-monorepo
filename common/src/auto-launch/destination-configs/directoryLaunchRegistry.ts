import { directorySiteKeyFromProviderSlug } from '../directorySiteKey.js';
import type { DirectoryLaunchProvider } from '../../browser-extension/pageAssist.js';
import { OPEN_LAUNCH_DIRECTORY_LAUNCH_PROVIDERS } from './openLaunch.js';
import { PEERPUSH_DIRECTORY_LAUNCH_PROVIDERS } from './peerpush.js';
import { UNEED_DIRECTORY_LAUNCH_PROVIDERS } from './uneed.js';

/** Registered directory launch destinations (extension manifest mirrors this list). */
export const directoryLaunchProviders = [
	...UNEED_DIRECTORY_LAUNCH_PROVIDERS,
	...PEERPUSH_DIRECTORY_LAUNCH_PROVIDERS,
	...OPEN_LAUNCH_DIRECTORY_LAUNCH_PROVIDERS,
] as const satisfies readonly DirectoryLaunchProvider[];

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
	tierLabel: DirectoryLaunchProvider['tierLabel'];
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

/**
 * Navigation URL for opening the directory form. The per-site registry (`defaultStartUrl`)
 * wins over `auto_launch_destinations.start_url` so extension behavior stays aligned with
 * `destination-configs/*.ts` without waiting on DB seeds to redeploy.
 */
export function resolveDirectoryLaunchStartUrl(
	providerSlug: string,
	destinationStartUrl?: string | null
): string {
	const provider = getDirectoryLaunchProvider(providerSlug);
	const registryUrl = provider?.defaultStartUrl?.trim();
	if (registryUrl) return registryUrl;
	return destinationStartUrl?.trim() ?? '';
}
