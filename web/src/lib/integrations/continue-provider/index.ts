import type { ContinueProviderStepConfig } from '$lib/integrations/continue-provider/types';

import { facebookContinueConfig } from '$lib/integrations/continue-provider/facebook';
import { instagramBusinessContinueConfig } from '$lib/integrations/continue-provider/instagram-business';
import { linkedinPageContinueConfig } from '$lib/integrations/continue-provider/linkedin-page';
import { youtubeContinueConfig } from '$lib/integrations/continue-provider/youtube';

export const continueProviderList: Record<string, ContinueProviderStepConfig> = {
	facebook: facebookContinueConfig,
	'instagram-business': instagramBusinessContinueConfig,
	'linkedin-page': linkedinPageContinueConfig,
	youtube: youtubeContinueConfig
};

export function getContinueProviderConfig(
	provider: string
): ContinueProviderStepConfig | null {
	return continueProviderList[provider] ?? null;
}

export function hasContinueProviderStep(provider: string): boolean {
	return provider in continueProviderList;
}

export { facebookContinueConfig } from '$lib/integrations/continue-provider/facebook';
export { instagramBusinessContinueConfig } from '$lib/integrations/continue-provider/instagram-business';
export { linkedinPageContinueConfig } from '$lib/integrations/continue-provider/linkedin-page';
export { youtubeContinueConfig } from '$lib/integrations/continue-provider/youtube';
export type {
	ContinueConnectPageRow,
	ContinueProviderSaveParams,
	ContinueProviderStepConfig,
	TwoStepPickerViewModel
} from '$lib/integrations/continue-provider/types';
