import { stringToSlug } from '$lib/ui/helpers/common';

export type ShouldSyncSlugFromTitleParams = {
	slug: string;
	title: string;
	slugManuallyEdited: boolean;
};

/** Same slug rules as backend link-directory / blog create when slug is omitted. */
export function slugFromTitle(title: string): string {
	return stringToSlug(title);
}

/**
 * Whether the admin editor should overwrite `slug` from `title`.
 * Stops after the user edits the slug field, or when loading an existing record (caller sets `slugManuallyEdited`).
 */
export function shouldSyncSlugFromTitle({
	slugManuallyEdited
}: ShouldSyncSlugFromTitleParams): boolean {
	return !slugManuallyEdited;
}
