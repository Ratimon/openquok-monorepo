import { icons } from '$data/icons';

import type { ContinueProviderStepConfig } from '$lib/integrations/continue-provider/types';

export const instagramBusinessContinueConfig: ContinueProviderStepConfig = {
	title: 'Choose an Instagram account',
	description:
		'Select the professional Instagram account linked to your Facebook Page. You can change this later by removing and re-adding the channel.',
	emptyPagesMessage:
		'No Instagram professional accounts were found. Link Instagram to a Facebook Page in Meta, then try again.',
	successToast: 'Instagram channel connected.',
	addedQueryProvider: 'instagram-business',
	fallbackIcon: icons.Instagram.name,
	validateRow: (row) => (row.pageId ? null : 'Could not resolve this account.'),
	toSaveParams: (row) => ({ pageId: row.pageId!, id: row.id })
};
