import type { PostCommentMode } from '$lib/ui/components/launches/AddPostButton.svelte';

export type LaunchProviderId = string;

export type LaunchProviderConfig = {
	/** Provider identifier, e.g. `threads`, `instagram-business`. */
	id: LaunchProviderId;
	/** Max characters allowed for the main post body. */
	maximumCharacters: number;
	/** Minimum characters required for the main post body. */
	minimumCharacters: number;
	/** Add-post button mode (comment vs post vs both). */
	postComment: PostCommentMode;
};

