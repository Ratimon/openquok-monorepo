import { openLaunchDirectoryChannel } from '$lib/content/constants/channels/catalog/directory-platforms/open-launch';
import { peerpushDirectoryChannel } from '$lib/content/constants/channels/catalog/directory-platforms/peerpush';
import { uneedDirectoryChannel } from '$lib/content/constants/channels/catalog/directory-platforms/uneed';
import {
	isPublicDirectoryChannelSlug,
	type PublicDirectoryChannelSlug
} from '$lib/content/constants/channels/catalog/directory-channel-slugs';

const DIRECTORY_CHANNELS = [
	peerpushDirectoryChannel,
	uneedDirectoryChannel,
	openLaunchDirectoryChannel
] as const;

export type PublicDirectoryChannelOption = {
	slug: PublicDirectoryChannelSlug;
	label: string;
};

export function listPublicDirectoryChannelOptions(): PublicDirectoryChannelOption[] {
	return DIRECTORY_CHANNELS.map((channel) => ({
		slug: channel.slug as PublicDirectoryChannelSlug,
		label: channel.platformLabel
	}));
}

export function publicDirectoryChannelLabel(slug: string): string {
	const key = slug.trim().toLowerCase();
	const match = DIRECTORY_CHANNELS.find((channel) => channel.slug === key);
	if (match) {
		return match.platformLabel;
	}
	return isPublicDirectoryChannelSlug(key) ? key : slug.trim();
}
