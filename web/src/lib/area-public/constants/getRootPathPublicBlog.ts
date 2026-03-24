/** Route segment for the public blog index (no leading slash). */
export function getRootPathPublicBlog(): string {
	return 'blog';
}

/** Route segment for a public blog post: `blog/{slug}` (no leading slash). */
export function getRootPathPublicBlogPost(slug: string): string {
	return `${getRootPathPublicBlog()}/${slug}`;
}

/** Public blog author profile: `blog/author/{identifier}` (no leading slash). */
export function getRootPathPublicBlogAuthor(identifier: string): string {
	return `${getRootPathPublicBlog()}/author/${identifier}`;
}
