import type { LaunchProviderConfig } from '$lib/ui/components/posts/providers/provider.types';

import { facebookProvider } from '$lib/ui/components/posts/providers/facebook/facebook.provider';
import { instagramProvider } from '$lib/ui/components/posts/providers/instagram/instagram.provider';
import { linkedinProvider } from '$lib/ui/components/posts/providers/linkedin/linkedin.provider';
import { threadsProvider } from '$lib/ui/components/posts/providers/threads/threads.provider';
import { tiktokProvider } from '$lib/ui/components/posts/providers/tiktok/tiktok.provider';
import { xProvider } from '$lib/ui/components/posts/providers/x/x.provider';
import { youtubeProvider } from '$lib/ui/components/posts/providers/youtube/youtube.provider';

const DEFAULT_PROVIDER: LaunchProviderConfig = {
	id: 'default',
	maximumCharacters: 500,
	minimumCharacters: 0,
	postComment: 'ALL'
};

function normalizeIdentifier(identifier: string): string {
	return (identifier ?? '').trim().toLowerCase();
}

export function getLaunchProviderConfig(identifier: string | null | undefined): LaunchProviderConfig {
	const id = normalizeIdentifier(identifier ?? '');
	if (!id) return DEFAULT_PROVIDER;

	if (id === 'threads') return threadsProvider;

	if (id === 'facebook') return facebookProvider;

	if (id === 'youtube') return youtubeProvider;

	if (id === 'tiktok') return tiktokProvider;

	if (id === 'x') return xProvider;

	// Instagram variants (instagram, instagram-business, instagram-standalone)
	if (id.startsWith('instagram')) return instagramProvider;

	// LinkedIn personal profile + company Page share composer rules
	if (id === 'linkedin' || id === 'linkedin-page') return linkedinProvider;

	return DEFAULT_PROVIDER;
}

