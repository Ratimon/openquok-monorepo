import { getRootPathPublicBlogAuthor } from '$lib/area-public/constants/getRootPathPublicBlog';
import type { BlogAuthorPublicViewModel } from '$lib/blogs/GetBlog.presenter.svelte';
import { stringToSlug } from '$lib/ui/helpers/common';

type BlogAuthorProfileFields = Pick<BlogAuthorPublicViewModel, 'fullName' | 'username'>;

/** URL segment for a public author profile (`stringToSlug` of display name). */
export function getBlogAuthorProfileIdentifier(author: BlogAuthorProfileFields): string {
	return stringToSlug(author.fullName || author.username || 'Anonymous');
}

/** Path without leading slash: `blog/author/{identifier}`. */
export function getBlogAuthorProfilePath(author: BlogAuthorProfileFields): string {
	return getRootPathPublicBlogAuthor(getBlogAuthorProfileIdentifier(author));
}
