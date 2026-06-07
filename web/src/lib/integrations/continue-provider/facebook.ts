import { icons } from '$data/icons';

import type { ContinueProviderStepConfig } from '$lib/integrations/continue-provider/types';

export const facebookContinueConfig: ContinueProviderStepConfig = {
	title: 'Choose a Facebook Page',
	description:
		'Select the Page you want to publish to. You can change this later by removing and re-adding the channel.',
	emptyPagesMessage:
		'No Facebook Pages were found. Grant Page access during OAuth or check Business Manager, then try again.',
	successToast: 'Facebook Page connected.',
	addedQueryProvider: 'facebook',
	fallbackIcon: icons.Facebook.name,
	validateRow: () => null,
	toSaveParams: (row) => ({ pageId: row.id, id: row.id })
};
