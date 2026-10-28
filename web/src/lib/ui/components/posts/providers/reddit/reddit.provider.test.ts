import { describe, expect, it } from 'vitest';

import {
	checkRedditLaunchValidity,
	readRedditLaunchSettings,
	redditPerChannelSettingsActive,
	REDDIT_MAX_CHARACTERS,
	REDDIT_TITLE_MAX_LENGTH
} from '$lib/ui/components/posts/providers/reddit/reddit.provider';

describe('reddit.provider', () => {
	it('reads nested bucket settings', () => {
		const settings = readRedditLaunchSettings({
			title: 'flat',
			reddit: {
				subreddit: 'openquok',
				title: 'Launch day'
			}
		});
		expect(settings).toEqual({
			subreddit: 'r/openquok',
			title: 'Launch day'
		});
	});

	it('normalizes subreddit and profile prefixes', () => {
		const settings = readRedditLaunchSettings({
			reddit: { subreddit: 'r/test', title: 'Hi' }
		});
		expect(settings.subreddit).toBe('r/test');
		const profile = readRedditLaunchSettings({
			reddit: { subreddit: 'u/wynne_wolf', title: 'Hi' }
		});
		expect(profile.subreddit).toBe('u/wynne_wolf');
	});

	it('allows global copy-only posts with empty settings', () => {
		expect(checkRedditLaunchValidity({ subreddit: '', title: '' })).toBe(true);
		expect(checkRedditLaunchValidity({ subreddit: '', title: 'Caption only' })).toMatch(
			/r\/name or u\/name/
		);
	});

	it('validates community and title when per-channel settings are active', () => {
		expect(checkRedditLaunchValidity({ subreddit: 'r/test', title: '' })).toBe(
			'Reddit posts require a title'
		);
		expect(
			checkRedditLaunchValidity({
				subreddit: 'r/bad!',
				title: 'Hi'
			})
		).toMatch(/valid name/);
		expect(
			checkRedditLaunchValidity({
				subreddit: 'r/test',
				title: 'x'.repeat(REDDIT_TITLE_MAX_LENGTH + 1)
			})
		).toMatch(/at most/);
		expect(checkRedditLaunchValidity({ subreddit: 'r/test', title: 'Hi' })).toBe(true);
	});

	it('detects when per-channel settings are in use', () => {
		expect(redditPerChannelSettingsActive({ subreddit: '', title: '' })).toBe(false);
		expect(redditPerChannelSettingsActive({ subreddit: 'x', title: '' })).toBe(true);
		expect(redditPerChannelSettingsActive({ subreddit: '', title: 't' })).toBe(true);
	});

	it('exports backend-aligned character cap', () => {
		expect(REDDIT_MAX_CHARACTERS).toBe(10000);
	});
});
