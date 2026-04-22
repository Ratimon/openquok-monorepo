import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';

export type LaunchProviderId = string;

export type LaunchProviderCommentsMode = boolean | 'no-media';

export type InstagramLaunchProviderSettings = {
	postType: 'post' | 'story';
	collaborators: string[];
	trialReel: boolean;
};

export type LaunchProviderCheckContext = {
	media: { id: string; path: string }[];
	/** Per-integration settings (from the Settings panel), shape is provider-specific. */
	settings: Record<string, unknown>;
};

export type LaunchProviderConfig = {
	/** Provider identifier, e.g. `threads`, `instagram-business`. */
	id: LaunchProviderId;
	/** Max characters allowed for the main post body. */
	maximumCharacters: number;
	/** Minimum characters required for the main post body. */
	minimumCharacters: number;
	/** Add-post button mode (comment vs post vs both). */
	postComment: PostCommentMode;
	/**
	 * Extra media affordances for the launch composer:
	 * - `true` — user can add multiple attachments
	 * - `'no-media'` — after one attachment, block adding more via the composer chrome (single-attachment networks)
	 */
	comments?: LaunchProviderCommentsMode;
	/**
	 * Optional provider-level scheduling validation before save.
	 * Return a user-facing string on failure, or `true` when valid.
	 */
	checkValidity?: (ctx: LaunchProviderCheckContext) => true | string;
};

