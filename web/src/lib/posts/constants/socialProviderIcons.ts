import type { IconName } from '$data/icon';
import { icons } from '$data/icon';

/** Integration catalog / channel `identifier` → AbstractIcon name. Single source for calendar, account, composer, docs overlap. */
export const socialProviderIconByIdentifier: Record<string, IconName> = {
	facebook: icons.Facebook.name,
	instagram: icons.Instagram.name,
	'instagram-business': icons.Instagram.name,
	'instagram-standalone': icons.InstagramGlyph.name,
	youtube: icons.YouTube.name,
	tiktok: icons.TikTok.name,
	x: icons.X.name,
	threads: icons.Threads.name
};

export function socialProviderIcon(identifier: string | null | undefined): IconName {
	if (identifier == null || String(identifier).trim() === '') {
		return icons.Link.name;
	}
	const id = String(identifier);
	return socialProviderIconByIdentifier[id] ?? icons.Link.name;
}
