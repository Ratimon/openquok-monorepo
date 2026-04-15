import type { LaunchProviderConfig } from '$lib/ui/components/launches/providers/provider.types';

import { instagramProvider } from '$lib/ui/components/launches/providers/instagram/instagram.provider';
import { threadsProvider } from '$lib/ui/components/launches/providers/threads/threads.provider';

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

	// Instagram variants (instagram, instagram-business, instagram-standalone)
	if (id.startsWith('instagram')) return instagramProvider;

	return DEFAULT_PROVIDER;
}

