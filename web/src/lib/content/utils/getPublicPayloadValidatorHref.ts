import type { PublicApiPlatformSlug } from '$lib/content/constants/apis/types';

import {
	getRootPathPublicPayloadWizard,
	getRootPathPublicPayloadWizardChannel
} from '$lib/area-public/constants/getRootPathPublicTools';
import { route } from '$lib/utils/path';

export function getPublicPayloadValidatorHref(slug?: PublicApiPlatformSlug | null): string {
	if (slug) {
		return route(getRootPathPublicPayloadWizardChannel(slug));
	}

	return route(getRootPathPublicPayloadWizard());
}
