import { icons } from '$data/icons';

import type { ContinueProviderStepConfig } from '$lib/integrations/continue-provider/types';

export const linkedinPageContinueConfig: ContinueProviderStepConfig = {
	title: 'Select a LinkedIn Page',
	description:
		'Choose the company Page you administer. You can change this later by removing and re-adding the channel.',
	emptyPagesMessage:
		'No LinkedIn Pages were found for this account. Confirm you are a Page admin, then try again.',
	successToast: 'LinkedIn Page connected.',
	addedQueryProvider: 'linkedin-page',
	fallbackIcon: icons.LinkedInGlyph.name,
	validateRow: () => null,
	toSaveParams: (row) => ({ pageId: row.id, id: row.id })
};
