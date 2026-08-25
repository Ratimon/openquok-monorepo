/** Shown when delete is blocked because the channel still has posts (HTTP 409). */
export const CHANNEL_DELETE_HAS_POSTS_MESSAGE =
	'Delete the posts for this channel first, or disable the channel instead.';

const BACKEND_CHANNEL_HAS_POSTS_PATTERN = /posts associated with this channel/i;

/**
 * Maps channel-delete failures to user-facing copy.
 * 409 (and the backend “has posts” message) become a disable-or-delete-posts hint.
 */
export function userFacingChannelDeleteError(message: string, status?: number): string {
	if (status === 409 || BACKEND_CHANNEL_HAS_POSTS_PATTERN.test(message)) {
		return CHANNEL_DELETE_HAS_POSTS_MESSAGE;
	}
	return message;
}
