import type { SocialComposerMediaItem } from '../../social/openquokSocialApi.js';

export type ComposerMediaStripOptions = {
	items: SocialComposerMediaItem[];
	uploading?: boolean;
	onRemove: (id: string) => void;
};

function isVideoPreviewItem(item: SocialComposerMediaItem): boolean {
	const mime = item.pendingFile?.type?.toLowerCase() ?? '';
	if (mime.startsWith('video/')) return true;
	const label =
		item.pendingFile?.name ?? item.path ?? item.previewUrl ?? item.pendingSourceUrl ?? '';
	return /\.(mp4|mov|webm|m4v|mpeg)$/i.test(label);
}

export function mountComposerMediaStrip(
	host: HTMLElement,
	opts: ComposerMediaStripOptions
): () => void {
	const cleanupFns: Array<() => void> = [];
	host.replaceChildren();

	if (opts.items.length === 0 && !opts.uploading) {
		host.classList.add('composer-media-strip-host--empty');
		return () => {
			host.replaceChildren();
			host.classList.remove('composer-media-strip-host--empty');
		};
	}

	host.classList.remove('composer-media-strip-host--empty');

	const wrap = document.createElement('div');
	wrap.className = 'composer-media-strip';
	wrap.setAttribute('role', 'list');
	wrap.setAttribute('aria-label', 'Attached media');

	for (const item of opts.items) {
		const cell = document.createElement('div');
		cell.className = 'composer-media-thumb';
		cell.setAttribute('role', 'listitem');

		const preview = document.createElement('div');
		preview.className = 'composer-media-thumb-preview';

		const previewSrc = item.previewUrl?.trim();
		if (previewSrc && !isVideoPreviewItem(item)) {
			const img = document.createElement('img');
			img.className = 'composer-media-thumb-img';
			img.src = previewSrc;
			img.alt = '';
			img.decoding = 'async';
			preview.appendChild(img);
		} else if (previewSrc && isVideoPreviewItem(item)) {
			const video = document.createElement('video');
			video.className = 'composer-media-thumb-video';
			video.src = previewSrc;
			video.muted = true;
			video.playsInline = true;
			video.preload = 'metadata';
			preview.appendChild(video);
			const badge = document.createElement('span');
			badge.className = 'composer-media-thumb-video-badge';
			badge.setAttribute('aria-hidden', 'true');
			badge.textContent = 'Video';
			preview.appendChild(badge);
		} else {
			const placeholder = document.createElement('span');
			placeholder.className = 'composer-media-thumb-placeholder';
			placeholder.textContent = isVideoPreviewItem(item) ? 'Video' : 'Image';
			preview.appendChild(placeholder);
		}

		const removeBtn = document.createElement('button');
		removeBtn.type = 'button';
		removeBtn.className = 'composer-media-thumb-remove';
		removeBtn.setAttribute('aria-label', 'Remove attachment');
		removeBtn.title = 'Remove';
		removeBtn.textContent = '×';
		if (opts.uploading) {
			removeBtn.disabled = true;
		}
		const onRemove = () => opts.onRemove(item.id);
		removeBtn.addEventListener('click', onRemove);
		cleanupFns.push(() => removeBtn.removeEventListener('click', onRemove));

		cell.append(preview, removeBtn);
		wrap.appendChild(cell);
	}

	if (opts.uploading) {
		const pending = document.createElement('div');
		pending.className = 'composer-media-thumb composer-media-thumb--uploading';
		pending.setAttribute('role', 'listitem');
		pending.setAttribute('aria-label', 'Uploading');
		const spinner = document.createElement('span');
		spinner.className = 'composer-media-upload-spinner';
		spinner.textContent = '…';
		pending.appendChild(spinner);
		wrap.appendChild(pending);
	}

	host.appendChild(wrap);

	return () => {
		for (const fn of cleanupFns) fn();
		host.replaceChildren();
		host.classList.remove('composer-media-strip-host--empty');
	};
}
