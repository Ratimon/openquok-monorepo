import type { LaunchProviderConfig } from '$lib/ui/components/posts/providers/provider.types';

/** Facebook Page composer limits (matches backend `FacebookProvider.maxLength`). */
export const FACEBOOK_MAX_CHARACTERS = 63_206;

export const facebookProvider: LaunchProviderConfig = {
	id: 'facebook',
	maximumCharacters: FACEBOOK_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	comments: 'no-media'
};
