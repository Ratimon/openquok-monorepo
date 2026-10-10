import { describe, expect, it } from 'vitest';

import {
	checkSkoolLaunchValidity,
	readSkoolLaunchSettings,
	SKOOL_MAX_CHARACTERS
} from '$lib/ui/components/posts/providers/skool/skool.provider';

describe('skool.provider', () => {
	it('reads nested bucket settings', () => {
		const settings = readSkoolLaunchSettings({
			title: 'flat',
			skool: {
				title: 'Community update',
				group: 'grp-1',
				groupLabel: 'OpenQuok',
				label: 'lbl-2',
				labelLabel: 'Announcements'
			}
		});
		expect(settings).toEqual({
			title: 'Community update',
			group: 'grp-1',
			groupLabel: 'OpenQuok',
			label: 'lbl-2',
			labelLabel: 'Announcements'
		});
	});

	it('falls back to flat CLI keys', () => {
		const settings = readSkoolLaunchSettings({
			title: 'CLI title',
			group_id: 'g-99',
			label: 'none'
		});
		expect(settings.title).toBe('CLI title');
		expect(settings.group).toBe('g-99');
		expect(settings.label).toBeUndefined();
	});

	it('validates title and group', () => {
		expect(checkSkoolLaunchValidity({ title: '', group: 'g1' })).toBe('Skool posts require a title');
		expect(checkSkoolLaunchValidity({ title: 'Hi', group: '' })).toBe('Select a Skool group');
		expect(checkSkoolLaunchValidity({ title: 'Hi', group: 'g1' })).toBe('Select a Skool category');
		expect(checkSkoolLaunchValidity({ title: 'Hi', group: 'g1', label: 'cat-1' })).toBe(true);
	});

	it('exports backend-aligned character cap', () => {
		expect(SKOOL_MAX_CHARACTERS).toBe(5000);
	});
});
