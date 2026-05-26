export const postsLimitKey = Symbol('postsLimit');

/** Monthly scheduled/published post cap; set by {@link PostsLimitProvider}. */
export type PostsLimitContext = {
	isPostsLimitFull: () => boolean;
	openUpgradeDialog: () => void;
	tryCreatePost: (run: () => void | Promise<void>) => void;
	/** Optimistically adjust `posts.used` for draft ↔ scheduled moves and new schedules. */
	adjustPostsUsedThisMonth: (delta: number) => void;
};
