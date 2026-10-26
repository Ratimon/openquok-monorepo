import { describe, expect, it } from 'vitest';

import { buildDirectoryChannelNavigateMessage } from './directoryChannelNavigateDialog.js';

describe('directoryChannelNavigateDialog', () => {
	it('mentions autofill when switching away from an active launch', () => {
		const message = buildDirectoryChannelNavigateMessage({
			channelName: 'PeerPush — Free queue',
			targetUrl: 'https://peerpush.com/pricing',
			activeLaunchSlug: 'uneed-join-line',
			activeLaunchLabel: 'Uneed — Join the line',
			selectedSlug: 'peerpush-free-queue',
		});
		expect(message).toContain('PeerPush — Free queue');
		expect(message).toContain('https://peerpush.com/pricing');
		expect(message).toContain('Uneed — Join the line');
	});
});
