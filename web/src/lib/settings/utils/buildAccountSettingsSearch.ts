export type DeveloperSettingsTabId = 'access' | 'apps';

const DEVELOPER_TAB_PARAM = 'tab';

export function parseDeveloperSettingsTab(value: string | null): DeveloperSettingsTabId {
	return value === 'apps' ? 'apps' : 'access';
}

export function buildAccountSettingsSearchParams(
	section: string,
	options?: { developerTab?: DeveloperSettingsTabId }
): string {
	const params = new URLSearchParams({ section });
	if (options?.developerTab === 'apps') {
		params.set(DEVELOPER_TAB_PARAM, 'apps');
	}
	return params.toString();
}
