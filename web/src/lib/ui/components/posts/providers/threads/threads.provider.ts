import type { LaunchProviderConfig } from '$lib/ui/components/posts/providers/provider.types';

export const threadsProvider: LaunchProviderConfig = {
	id: 'threads',
	maximumCharacters: 500,
	minimumCharacters: 0,
	postComment: 'POST'
};

