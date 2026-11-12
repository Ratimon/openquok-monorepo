import type { AutoLaunchExtensionConfig } from 'openquok-common';
import { getDirectoryExtensionConfigFixture } from 'openquok-common';

/**
 * Handoff carries `extension_config` from the API (DB snapshot). The bundled fixture
 * in `destination-configs/*.ts` is the fill/compare source of truth for shipped builds.
 */
export function mergeExtensionConfigWithShippedFixture(
	providerSlug: string,
	fromHandoff: AutoLaunchExtensionConfig
): AutoLaunchExtensionConfig {
	const fixture = getDirectoryExtensionConfigFixture(providerSlug);
	if (!fixture) return fromHandoff;
	return {
		...fromHandoff,
		version: fixture.version ?? fromHandoff.version,
		startUrlPatterns: fixture.startUrlPatterns ?? fromHandoff.startUrlPatterns,
		readyUrlHint: fixture.readyUrlHint ?? fromHandoff.readyUrlHint,
		proof: fixture.proof ?? fromHandoff.proof,
		steps: fixture.steps ?? fromHandoff.steps,
	};
}
