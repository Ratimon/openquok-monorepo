import type { AutoLaunchProfileSnapshot } from '../browser-extension/pageAssist.js';
import { resolveProfilePathValue } from './listingProfileFingerprint.js';

const BASE_PROFILE_PATHS = ['name', 'tagline', 'description', 'website_url', 'logo_url'] as const;

function collectProfileDataPaths(
	mainData: Record<string, unknown> | null | undefined,
	variantData: Record<string, unknown> | null | undefined
): string[] {
	const keys = new Set([
		...Object.keys(mainData ?? {}),
		...Object.keys(variantData ?? {}),
	]);
	return [...keys]
		.sort((a, b) => a.localeCompare(b))
		.map((key) => `profile_data.${key}`);
}

/**
 * Path-based similarity between a directory variant snapshot and its main profile (0–100).
 * Uses the same normalized values as listing fingerprints / extension fill.
 */
export function profileSimilarityPercentToMain(
	main: AutoLaunchProfileSnapshot,
	variant: AutoLaunchProfileSnapshot
): number {
	const paths = [
		...BASE_PROFILE_PATHS,
		...collectProfileDataPaths(
			(main.profile_data ?? {}) as Record<string, unknown>,
			(variant.profile_data ?? {}) as Record<string, unknown>
		),
	];
	if (paths.length === 0) return 100;

	let matching = 0;
	for (const profilePath of paths) {
		const mainValue = resolveProfilePathValue(main, profilePath);
		const variantValue = resolveProfilePathValue(variant, profilePath);
		if (mainValue === variantValue) matching += 1;
	}

	return Math.round((100 * matching) / paths.length);
}
