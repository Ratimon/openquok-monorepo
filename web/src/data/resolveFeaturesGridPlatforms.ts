import type { LandingSocialPlatform } from '$data/landing-social-platforms';
import { featuresGridPlatformsForRow } from '$data/landing-social-platforms';
import {
	featuresGridDirectoryPlatformsForRow,
	isLandingDirectoryPlatformId
} from '$data/landing-directory-platforms';

/** Resolve each tile id from the social or directory catalog (home rows can mix both). */
export function resolveFeaturesGridPlatforms(platformIds: string[]): LandingSocialPlatform[] {
	const out: LandingSocialPlatform[] = [];
	for (const id of platformIds) {
		const platform = isLandingDirectoryPlatformId(id)
			? featuresGridDirectoryPlatformsForRow([id])[0]
			: featuresGridPlatformsForRow([id])[0];
		if (platform) out.push(platform);
	}
	return out;
}
