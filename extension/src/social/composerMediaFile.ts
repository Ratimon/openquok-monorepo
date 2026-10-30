/** Extension composer: images and video only (mirrors dashboard composer accept rules). */
export function isComposerMediaFile(file: File): boolean {
	const mime = file.type.toLowerCase();
	if (mime.startsWith('image/') || mime.startsWith('video/')) return true;
	return /\.(png|jpe?g|gif|webp|svg|avif|mp4|mov|webm|m4v|mpeg)$/i.test(file.name);
}

export const MAX_COMPOSER_MEDIA_ATTACHMENTS = 10;
