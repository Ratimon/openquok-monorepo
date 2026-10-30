import type { SocialComposerMediaItem } from '../../social/openquokSocialApi.js';

export function composerPreviewMediaUrls(items: SocialComposerMediaItem[]): string[] {
	const urls: string[] = [];
	for (const item of items) {
		const url = item.previewUrl?.trim();
		if (url) urls.push(url);
	}
	return urls;
}

export function isComposerPreviewVideoUrl(url: string, pendingFile?: File): boolean {
	const mime = pendingFile?.type?.toLowerCase() ?? '';
	if (mime.startsWith('video/')) return true;
	return /\.(mp4|mov|webm|m4v|mpeg)$/i.test(url);
}

export function firstComposerPreviewMedia(
	items: SocialComposerMediaItem[]
): { url: string; isVideo: boolean } | null {
	for (const item of items) {
		const url = item.previewUrl?.trim();
		if (!url) continue;
		return {
			url,
			isVideo: isComposerPreviewVideoUrl(url, item.pendingFile),
		};
	}
	return null;
}
