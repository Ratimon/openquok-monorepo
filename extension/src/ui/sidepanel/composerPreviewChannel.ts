import {
	isSocialComposerChannel,
	type SocialIntegrationChannel,
} from '../../social/openquokSocialApi.js';

/** Mirrors dashboard `previewChannel`: one selected schedulable target, else global preview. */
export function resolveComposerPreviewChannel(
	channels: SocialIntegrationChannel[],
	selectedIds: Set<string>
): SocialIntegrationChannel | null {
	const selected = channels.filter(
		(ch) => selectedIds.has(ch.id) && isSocialComposerChannel(ch)
	);
	if (selected.length === 1) return selected[0];
	return null;
}

export type ComposerPreviewLayout = 'global' | 'x' | 'threads' | 'channel';

export function composerPreviewLayout(
	channel: SocialIntegrationChannel | null,
	selectedSchedulableCount: number
): ComposerPreviewLayout {
	if (!channel || selectedSchedulableCount > 1) return 'global';
	const id = channel.identifier.trim().toLowerCase();
	if (id === 'x') return 'x';
	if (id === 'threads') return 'threads';
	return 'channel';
}

/** Character cap for overflow highlighting (approximates web launch provider configs). */
export function composerPreviewMaxCharacters(
	channel: SocialIntegrationChannel | null,
	selectedSchedulableCount: number
): number {
	if (!channel || selectedSchedulableCount > 1) return 10_000;
	const id = channel.identifier.trim().toLowerCase();
	if (id === 'x') return 280;
	if (id === 'threads') return 500;
	if (id === 'bluesky') return 300;
	if (id.startsWith('instagram')) return 2200;
	if (id === 'linkedin' || id === 'linkedin-page') return 3000;
	if (id === 'facebook') return 63_206;
	if (id === 'youtube') return 5000;
	if (id === 'tiktok') return 4000;
	if (id === 'devto') return 4000;
	if (id === 'skool') return 10_000;
	return 500;
}
