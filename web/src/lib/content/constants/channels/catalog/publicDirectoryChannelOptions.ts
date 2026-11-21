import {
	isPublicDirectoryChannelSlug,
	type PublicDirectoryChannelSlug
} from '$lib/content/constants/channels/catalog/directory-channel-slugs';
import { PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES } from '$lib/content/constants/channels/catalog/directory-seeds';

export type PublicDirectoryChannelOption = {
	slug: PublicDirectoryChannelSlug;
	label: string;
};

export function listPublicDirectoryChannelOptions(): PublicDirectoryChannelOption[] {
	return PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES.map((channel) => ({
		slug: channel.slug as PublicDirectoryChannelSlug,
		label: channel.platformLabel
	}));
}

export function publicDirectoryChannelLabel(slug: string): string {
	const key = slug.trim().toLowerCase();
	const match = PUBLIC_DIRECTORY_CHANNEL_LANDING_PAGES.find((channel) => channel.slug === key);
	if (match) {
		return match.platformLabel;
	}
	return isPublicDirectoryChannelSlug(key) ? key : slug.trim();
}