import {
	isSocialComposerChannel,
	type SocialComposerMediaItem,
	type SocialIntegrationChannel,
	type SocialSessionContext,
} from '../../social/openquokSocialApi.js';

import {
	composerPreviewLayout,
	composerPreviewMaxCharacters,
	resolveComposerPreviewChannel,
} from './composerPreviewChannel.js';
import { firstComposerPreviewMedia } from './composerPreviewMedia.js';
import {
	resolveIntegrationChannelAvatarSrc,
	retryIntegrationChannelAvatarSrc,
} from './integrationChannelAvatar.js';
import { getSocialProviderBadgeSvg } from './socialProviderBadgeSvg.js';
const VERIFIED_BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;

export type ComposerPostPreviewOptions = {
	session: SocialSessionContext;
	channels: SocialIntegrationChannel[];
	selectedIds: Set<string>;
	body: string;
	attachedMedia: SocialComposerMediaItem[];
};

function channelInitials(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) return '?';
	return trimmed.slice(0, 2);
}

function selectedSchedulableCount(
	channels: SocialIntegrationChannel[],
	selectedIds: Set<string>
): number {
	let count = 0;
	for (const ch of channels) {
		if (selectedIds.has(ch.id) && isSocialComposerChannel(ch)) count += 1;
	}
	return count;
}

function splitPreviewText(text: string, maxChars: number): { visible: string; overflow: string } {
	if (text.length <= maxChars) {
		return { visible: text, overflow: '' };
	}
	return { visible: text.slice(0, maxChars), overflow: text.slice(maxChars) };
}

function previewTitle(channel: SocialIntegrationChannel | null, schedulableCount: number): string {
	if (channel && schedulableCount === 1) return channel.name.trim() || 'Channel';
	if (schedulableCount > 1) return 'Global Edit';
	return 'Post preview';
}

export type ComposerPostPreviewController = {
	update: (next: ComposerPostPreviewOptions) => void;
	destroy: () => void;
};

export function mountComposerPostPreview(
	host: HTMLElement,
	opts: ComposerPostPreviewOptions
): ComposerPostPreviewController {
	const cleanupFns: Array<() => void> = [];
	host.replaceChildren();
	host.classList.add('composer-post-preview-host');

	const card = document.createElement('article');
	card.className = 'composer-post-preview';
	card.setAttribute('aria-label', 'Post preview');

	const header = document.createElement('div');
	header.className = 'composer-post-preview-header';

	const avatarWrap = document.createElement('div');
	avatarWrap.className = 'composer-post-preview-avatar-wrap';

	const avatar = document.createElement('span');
	avatar.className = 'composer-post-preview-avatar';
	avatar.setAttribute('aria-hidden', 'true');

	const providerBadge = document.createElement('span');
	providerBadge.className = 'composer-post-preview-provider-badge';
	providerBadge.hidden = true;

	avatarWrap.append(avatar, providerBadge);

	const meta = document.createElement('div');
	meta.className = 'composer-post-preview-meta';

	const nameRow = document.createElement('div');
	nameRow.className = 'composer-post-preview-name-row';

	const nameEl = document.createElement('div');
	nameEl.className = 'composer-post-preview-name';

	const verified = document.createElement('span');
	verified.className = 'composer-post-preview-verified';
	verified.innerHTML = VERIFIED_BADGE_SVG;

	nameRow.append(nameEl, verified);

	const bodyEl = document.createElement('p');
	bodyEl.className = 'composer-post-preview-body';

	const placeholderEl = document.createElement('p');
	placeholderEl.className = 'composer-post-preview-placeholder';
	placeholderEl.textContent = 'Start writing your post for a preview';

	meta.append(nameRow, bodyEl, placeholderEl);
	header.append(avatarWrap, meta);

	const mediaWrap = document.createElement('div');
	mediaWrap.className = 'composer-post-preview-media';
	mediaWrap.hidden = true;

	const mediaFrame = document.createElement('div');
	mediaFrame.className = 'composer-post-preview-media-frame';
	mediaWrap.appendChild(mediaFrame);

	const mediaMore = document.createElement('span');
	mediaMore.className = 'composer-post-preview-media-more';
	mediaMore.hidden = true;
	mediaWrap.appendChild(mediaMore);

	const footer = document.createElement('div');
	footer.className = 'composer-post-preview-footer';
	footer.hidden = true;

	card.append(header, mediaWrap, footer);
	host.appendChild(card);

	let avatarObjectUrl: string | null = null;
	let avatarChannelId: string | null = null;
	let avatarLoadGeneration = 0;

	function revokeAvatarUrl(): void {
		if (avatarObjectUrl?.startsWith('blob:')) {
			URL.revokeObjectURL(avatarObjectUrl);
		}
		avatarObjectUrl = null;
	}

	function setAvatarInitials(initials: string): void {
		revokeAvatarUrl();
		avatar.replaceChildren();
		avatar.textContent = initials;
		avatar.classList.add('composer-post-preview-avatar--initials');
	}

	function setAvatarImage(src: string): void {
		avatar.classList.remove('composer-post-preview-avatar--initials');
		avatar.replaceChildren();
		const img = document.createElement('img');
		img.className = 'composer-post-preview-avatar-img';
		img.alt = '';
		img.decoding = 'async';
		img.referrerPolicy = 'no-referrer';
		img.src = src;
		const onError = () => {
			if (!previewChannel) {
				setAvatarInitials('?');
				return;
			}
			void retryIntegrationChannelAvatarSrc(opts.session, previewChannel, src).then((retrySrc) => {
				if (retrySrc) {
					if (retrySrc.startsWith('blob:')) avatarObjectUrl = retrySrc;
					img.src = retrySrc;
				}
			});
		};
		img.addEventListener('error', onError);
		cleanupFns.push(() => img.removeEventListener('error', onError));
		avatar.appendChild(img);
	}

	let previewChannel: SocialIntegrationChannel | null = null;

	async function loadAvatar(channel: SocialIntegrationChannel | null): Promise<void> {
		avatarLoadGeneration += 1;
		const generation = avatarLoadGeneration;
		previewChannel = channel;

		if (!channel) {
			avatarChannelId = null;
			setAvatarInitials('OQ');
			return;
		}

		avatarChannelId = channel.id;
		const initials = channelInitials(channel.name);
		setAvatarInitials(initials);

		const src = await resolveIntegrationChannelAvatarSrc(opts.session, channel);
		if (generation !== avatarLoadGeneration || avatarChannelId !== channel.id) return;
		if (src) {
			if (src.startsWith('blob:')) avatarObjectUrl = src;
			setAvatarImage(src);
		}
	}

	function renderMedia(
		attachedMedia: SocialComposerMediaItem[],
		layout: ReturnType<typeof composerPreviewLayout>
	): void {
		mediaFrame.replaceChildren();
		const first = firstComposerPreviewMedia(attachedMedia);
		if (!first) {
			mediaWrap.hidden = true;
			mediaMore.hidden = true;
			return;
		}

		mediaWrap.hidden = false;
		mediaFrame.classList.toggle('composer-post-preview-media-frame--threads', layout === 'threads');
		mediaFrame.classList.toggle('composer-post-preview-media-frame--video', first.isVideo);

		if (first.isVideo) {
			const video = document.createElement('video');
			video.className = 'composer-post-preview-media-video';
			video.src = first.url;
			video.muted = true;
			video.playsInline = true;
			video.preload = 'metadata';
			mediaFrame.appendChild(video);
		} else {
			const img = document.createElement('img');
			img.className = 'composer-post-preview-media-img';
			img.src = first.url;
			img.alt = '';
			img.decoding = 'async';
			mediaFrame.appendChild(img);
		}

		const extra = attachedMedia.filter((item) => item.previewUrl?.trim()).length - 1;
		if (extra > 0) {
			mediaMore.hidden = false;
			mediaMore.textContent = `+${extra} more`;
		} else {
			mediaMore.hidden = true;
		}
	}

	function update(next: ComposerPostPreviewOptions): void {
		opts = next;
		const schedulableCount = selectedSchedulableCount(next.channels, next.selectedIds);
		const channel = resolveComposerPreviewChannel(next.channels, next.selectedIds);
		const layout = composerPreviewLayout(channel, schedulableCount);
		const maxChars = composerPreviewMaxCharacters(channel, schedulableCount);
		const body = next.body ?? '';

		card.className = `composer-post-preview composer-post-preview--${layout}`;

		if (channel && schedulableCount === 1) {
			providerBadge.hidden = false;
			providerBadge.innerHTML = getSocialProviderBadgeSvg(channel.identifier, 14);
		} else {
			providerBadge.hidden = true;
			providerBadge.replaceChildren();
		}

		void loadAvatar(channel);

		const title = previewTitle(channel, schedulableCount);
		nameEl.textContent = title;

		if (body.trim().length === 0) {
			bodyEl.hidden = true;
			placeholderEl.hidden = false;
		} else {
			placeholderEl.hidden = true;
			bodyEl.hidden = false;
			const { visible, overflow } = splitPreviewText(body, maxChars);
			bodyEl.replaceChildren();
			bodyEl.append(document.createTextNode(visible));
			if (overflow) {
				const mark = document.createElement('mark');
				mark.className = 'composer-post-preview-overflow';
				mark.title = 'This text will be cropped';
				mark.textContent = overflow;
				bodyEl.appendChild(mark);
			}
		}

		renderMedia(next.attachedMedia, layout);

		if (channel && schedulableCount === 1 && maxChars < 10_000) {
			footer.hidden = false;
			const count = body.length;
			footer.textContent = `${count} / ${maxChars}`;
			footer.classList.toggle('composer-post-preview-footer--over', count > maxChars);
		} else {
			footer.hidden = true;
		}
	}

	update(opts);

	const destroy = () => {
		avatarLoadGeneration += 1;
		for (const fn of cleanupFns) fn();
		revokeAvatarUrl();
		host.replaceChildren();
		host.classList.remove('composer-post-preview-host');
	};

	return { update, destroy };
}
