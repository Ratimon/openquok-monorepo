import { icons } from '$data/icons';

import type { ContinueProviderStepConfig } from '$lib/integrations/continue-provider/types';

export const youtubeContinueConfig: ContinueProviderStepConfig = {
	title: 'Choose a YouTube channel',
	description:
		'Select the channel you want to publish to. You can change this later by removing and re-adding the channel.',
	emptyPagesMessage:
		'No YouTube channels were found. Ensure your Google account manages a channel and grant access during OAuth, then try again.',
	successToast: 'YouTube channel connected.',
	addedQueryProvider: 'youtube',
	fallbackIcon: icons.YouTube.name,
	validateRow: () => null,
	toSaveParams: (row) => ({ pageId: row.id, id: row.id })
};
