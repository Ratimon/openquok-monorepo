import type { IconName } from '$data/icon';
import { icons } from '$data/icon';

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

export function socialProviderIcon(identifier: string): IconName {
	return socialProviderIconByIdentifier[identifier] ?? icons.Link.name;
}
