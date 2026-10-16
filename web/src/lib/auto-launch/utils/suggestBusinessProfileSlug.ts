import { stringToSlug } from '$lib/ui/helpers/common';

/** Directory listing slug from product name (same rules as blog / link-directory admin). */
export function suggestBusinessProfileSlug(name: string): string {
	return stringToSlug(name.trim()).slice(0, 120);
}
