/** Route segment for the social media posting API hub (no leading slash). */
export function getRootPathSocialMediaPostingApi(): string {
	return 'social-media-posting-api';
}

/** Route segment for the social media scheduling API hub (no leading slash). */
export function getRootPathSocialMediaSchedulingApi(): string {
	return 'social-media-scheduling-api';
}

/** Platform posting API landing: `social-media-posting-api/{slug}` (no leading slash). */
export function getRootPathSocialMediaPostingApiPlatform(slug: string): string {
	return `${getRootPathSocialMediaPostingApi()}/${slug.trim()}`;
}

/** Platform scheduling API landing: `social-media-scheduling-api/{slug}` (no leading slash). */
export function getRootPathSocialMediaSchedulingApiPlatform(slug: string): string {
	return `${getRootPathSocialMediaSchedulingApi()}/${slug.trim()}`;
}
