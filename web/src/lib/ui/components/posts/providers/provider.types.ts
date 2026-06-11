import type { PostCommentMode } from '$lib/ui/components/posts/AddPostButton.svelte';

export type LaunchProviderId = string;

export type LaunchProviderCommentsMode = boolean | 'no-media';

export type InstagramGraduationStrategy = 'MANUAL' | 'SS_PERFORMANCE';

export type InstagramLaunchProviderSettings = {
	postType: 'post' | 'story';
	collaborators: string[];
	trialReel: boolean;
	graduationStrategy: InstagramGraduationStrategy;
};

export type FacebookLaunchProviderSettings = {
	url?: string;
};

export type YoutubePrivacyStatus = 'public' | 'private' | 'unlisted';

export type YoutubeTagOption = { value: string; label: string };

export type YoutubeLaunchProviderSettings = {
	title: string;
	type: YoutubePrivacyStatus;
	selfDeclaredMadeForKids: 'yes' | 'no';
	tags: YoutubeTagOption[];
	thumbnail?: { path: string };
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
	 * Follow-up comment affordances (Post / Comment button modes).
	 * `'no-media'` means thread replies are text-only — it does **not** limit main-post carousel attachments.
	 */
	comments?: LaunchProviderCommentsMode;
	/**
	 * Optional provider-level scheduling validation before save.
	 * Return a user-facing string on failure, or `true` when valid.
	 */
	checkValidity?: (ctx: LaunchProviderCheckContext) => true | string;
	/** Async checks (e.g. video duration) run at schedule time. */
	checkValidityAsync?: (ctx: LaunchProviderCheckContext) => Promise<true | string>;
};

