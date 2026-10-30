import { describe, expect, it, vi } from 'vitest';

import { mountDirectoryChannelPicker } from './directoryChannelPicker.js';

describe('directoryChannelPicker', () => {
	it('mounts site avatars and reports selection', () => {
		vi.stubGlobal('chrome', {
			runtime: { getURL: (path: string) => `chrome-extension://test/${path}` },
		});

		const host = document.createElement('div');
		let selected = 'uneed-join-line';
		const destroy = mountDirectoryChannelPicker(host, {
			channels: [
				{ identifier: 'uneed-join-line', name: 'Uneed — Join the line', tierLabel: 'Free' },
				{
					identifier: 'peerpush-standard-launch',
					name: 'PeerPush — Standard launch',
					tierLabel: 'Paid',
				},
			],
			selectedId: selected,
			locked: false,
			onSelect: (id) => {
				selected = id;
			},
			onAddChannel: () => {},
		});

		const buttons = host.querySelectorAll('.channel-picker-btn');
		expect(buttons.length).toBe(3);
		expect(host.querySelector('.channel-add')).toBeTruthy();
		expect(host.querySelector('.channel-picker-btn--selected')).toBeTruthy();
		expect(host.querySelectorAll('.directory-channel-tier--free').length).toBe(1);
		expect(host.querySelectorAll('.directory-channel-tier--paid').length).toBe(1);

		const peerBtn = host.querySelector<HTMLButtonElement>(
			'button[data-channel-id="peerpush-standard-launch"]'
		);
		peerBtn?.click();
		expect(selected).toBe('peerpush-standard-launch');

		destroy();
		vi.unstubAllGlobals();
	});
});
