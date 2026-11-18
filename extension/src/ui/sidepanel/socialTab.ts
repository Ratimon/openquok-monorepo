import { inferMediaMimeType, validateMediaFileUploadSize } from 'openquok-common';

import { isDashboardLoggedIn } from '../../shared/dashboardAuth.js';
import { detachSocialDashboardExtension } from '../../shared/dashboardSocialDisconnect.js';
import {
	openDashboardAddChannel,
	openDashboardAppUrl,
} from '../../shared/openDashboardUrl.js';
import {
	createSocialPost,
	datetimeLocalToIso,
	defaultComposerScheduleLocal,
	findSuggestedScheduleSlot,
	isSocialComposerChannel,
	isoToDatetimeLocalValue,
	listSocialIntegrations,
	resolveSocialSession,
	type SocialApiFailure,
	type SocialComposerMediaItem,
	type SocialIntegrationChannel,
	type SocialSessionContext,
} from '../../social/openquokSocialApi.js';
import {
	isComposerMediaFile,
	MAX_COMPOSER_MEDIA_ATTACHMENTS,
} from '../../social/composerMediaFile.js';
import { applySocialComposerDraftWithMedia } from '../../social/applySocialComposerDraftWithMedia.js';
import { resolveComposerMediaAttachments } from '../../social/resolveComposerMediaAttachments.js';
import {
	clearSocialComposerDraft,
	peekSocialComposerDraft,
} from '../../social/sessionDraftStorage.js';

import { selectionMatchesGroup } from '../../social/socialChannelSelection.js';
import { buildRedditClipboardText, copyTextToClipboard } from '../../social/reddit/pendingPosts.js';
import { mountChannelPicker } from './channelPicker.js';
import { mountComposerMediaStrip } from './composerMediaStrip.js';
import { mountComposerPostPreview } from './composerPostPreview.js';
import { mountComposerToolbar } from './composerToolbar.js';
import { mountRedditActionNeeded, type RedditActionNeededController } from './redditActionNeeded.js';
import type { DashboardSessionSnapshot } from './dashboardSessionBar.js';
import { el, escapeHtml } from './uiHelpers.js';

export type MountSocialTabOptions = {
	getSessionSnapshot: () => DashboardSessionSnapshot;
};

export type SocialTabController = {
	refresh: () => Promise<void>;
	onDashboardDisconnected: () => void;
};

function isSocialApiFailure(
	value: SocialSessionContext | SocialApiFailure
): value is SocialApiFailure {
	return 'ok' in value && value.ok === false;
}

export function mountSocialTab(
	root: HTMLElement,
	options: MountSocialTabOptions
): SocialTabController {
	const getSessionSnapshot = options.getSessionSnapshot;
	let session: SocialSessionContext | null = null;
	let loadedChannels: SocialIntegrationChannel[] = [];
	let scheduleLocal = defaultComposerScheduleLocal();
	let selectedChannelIds = new Set<string>();
	let selectedGroupId: string | null = null;
	let bodyDraft = '';
	let attachedMedia: SocialComposerMediaItem[] = [];
	let mediaUploading = false;
	let mediaUploadError = '';
	let submitting = false;
	let destroyChannelPicker: (() => void) | null = null;
	let destroyComposerToolbar: (() => void) | null = null;
	let destroyMediaStrip: (() => void) | null = null;
	let postPreviewController: ReturnType<typeof mountComposerPostPreview> | null = null;
	let redditActionNeeded: RedditActionNeededController | null = null;
	let redditComposerCopyMessage = '';

	function newComposerMediaClientId(): string {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
			return crypto.randomUUID();
		}
		return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	}

	function syncComposerPostPreview(): void {
		if (!session || !postPreviewController) return;
		const bodyEl = root.querySelector<HTMLTextAreaElement>('#social-body');
		const body = bodyEl?.value ?? bodyDraft;
		postPreviewController.update({
			session,
			channels: loadedChannels,
			selectedIds: selectedChannelIds,
			body,
			attachedMedia,
		});
	}

	function revokeComposerMediaPreview(item: SocialComposerMediaItem): void {
		const url = item.previewUrl?.trim();
		if (url?.startsWith('blob:')) {
			URL.revokeObjectURL(url);
		}
	}

	function clearAttachedMedia(): void {
		for (const item of attachedMedia) {
			revokeComposerMediaPreview(item);
		}
		attachedMedia = [];
	}

	function removeAttachedMedia(id: string): void {
		const next: SocialComposerMediaItem[] = [];
		for (const item of attachedMedia) {
			if (item.id === id) {
				revokeComposerMediaPreview(item);
			} else {
				next.push(item);
			}
		}
		attachedMedia = next;
	}

	function handleComposerFilePick(files: FileList): void {
		if (!session || mediaUploading || submitting) return;
		const errors: string[] = [];
		mediaUploadError = '';

		for (const file of Array.from(files)) {
			if (attachedMedia.length >= MAX_COMPOSER_MEDIA_ATTACHMENTS) {
				errors.push(`Maximum ${MAX_COMPOSER_MEDIA_ATTACHMENTS} attachments.`);
				break;
			}
			if (!isComposerMediaFile(file)) {
				errors.push(`${file.name}: unsupported file type.`);
				continue;
			}
			const mime = inferMediaMimeType(file.name, file.type);
			const sizeError = validateMediaFileUploadSize(file.size, mime, 'frontend');
			if (sizeError) {
				errors.push(`${file.name}: ${sizeError}`);
				continue;
			}

			const previewUrl = URL.createObjectURL(file);
			attachedMedia = [
				...attachedMedia,
				{
					id: newComposerMediaClientId(),
					previewUrl,
					pendingFile: file,
				},
			];
		}

		mediaUploadError = errors.length > 0 ? errors.join(' ') : '';
		renderComposer(mediaUploadError || undefined);
	}

	function teardownRedditActionNeeded(): void {
		redditActionNeeded?.destroy();
		redditActionNeeded = null;
	}

	function teardownComposerWidgets(): void {
		destroyChannelPicker?.();
		destroyChannelPicker = null;
		destroyComposerToolbar?.();
		destroyComposerToolbar = null;
		destroyMediaStrip?.();
		destroyMediaStrip = null;
		postPreviewController?.destroy();
		postPreviewController = null;
		teardownRedditActionNeeded();
	}

	function renderSignedOutPlaceholder(): void {
		teardownComposerWidgets();
		root.replaceChildren(
			el(`
				<div class="wrap tab-wrap">
					<div class="card">
						<p class="muted">Sign in above to schedule posts and use connected channels.</p>
					</div>
					<p class="footer">OAuth and credential channels are connected in the dashboard — not in the extension.</p>
				</div>
			`)
		);
	}

	function renderSessionError(message: string): void {
		teardownComposerWidgets();
		root.replaceChildren(
			el(`
				<div class="wrap tab-wrap">
					<div class="gate-card">
						<strong>Could not open composer</strong>
						<p class="error" role="alert">${escapeHtml(message)}</p>
						<p class="muted">Make sure the API is running (local dev: backend on port 3000, dashboard on https://localhost:5173), then refresh.</p>
						<button type="button" id="social-session-retry" class="primary gate-refresh">Refresh</button>
						<button type="button" id="social-session-back-gate" class="secondary gate-refresh">Back to connect</button>
					</div>
				</div>
			`)
		);
		root.querySelector('#social-session-retry')?.addEventListener('click', () => {
			void refresh();
		});
		root.querySelector('#social-session-back-gate')?.addEventListener('click', () => {
			void (async () => {
				let origin = session?.dashboardOrigin ?? null;
				if (!origin) {
					const auth = await isDashboardLoggedIn();
					origin = new URL(auth.loginUrl).origin;
				}
				await detachSocialDashboardExtension(origin);
				session = null;
				loadedChannels = [];
				selectedChannelIds = new Set();
				selectedGroupId = null;
				renderSignedOutPlaceholder();
			})();
		});
	}

	function renderLoading(): void {
		teardownComposerWidgets();
		root.replaceChildren(
			el(`
				<div class="wrap tab-wrap">
					<p class="status">Checking your OpenQuok session…</p>
				</div>
			`)
		);
	}

	function selectedRedditChannelIds(): string[] {
		return loadedChannels
			.filter(
				(ch) =>
					selectedChannelIds.has(ch.id) &&
					ch.identifier.trim().toLowerCase() === 'reddit'
			)
			.map((ch) => ch.id);
	}

	function renderComposer(error?: string, success?: string): void {
		if (!session) return;

		const displayError =
			[error, mediaUploadError].filter((part) => part?.trim()).join(' ') || undefined;

		const showRedditCopy = selectedRedditChannelIds().length > 0;

		const composerHtml = `
			<div class="wrap tab-wrap">
				<div id="social-reddit-action-needed" class="reddit-action-host"></div>
				<div class="card">
					<strong>Compose</strong>
					<p class="muted">Schedule via your OpenQuok session — tokens stay on the server.</p>
				</div>
				<label class="field-label">Connected channels</label>
				<div id="social-channel-picker" class="channel-picker-host"></div>
				<label class="field-label" for="social-body">Post</label>
				<div class="composer-editor-shell">
					<textarea id="social-body" class="composer-body" rows="5" placeholder="What do you want to share?"></textarea>
					<div id="social-composer-toolbar" class="composer-toolbar-host"></div>
				</div>
				<div id="social-composer-media" class="composer-media-strip-host"></div>
				<label class="field-label">Preview</label>
				<div id="social-composer-preview" class="composer-post-preview-host" aria-live="polite"></div>
				<label class="field-label" for="social-schedule">Schedule time</label>
				<input id="social-schedule" class="composer-schedule" type="datetime-local" value="${escapeHtml(scheduleLocal)}" />
				<div class="actions composer-actions">
					<button type="button" id="social-publish-now-btn" class="primary" ${submitting ? 'disabled' : ''}>Publish now</button>
					<button type="button" id="social-schedule-btn" class="primary" ${submitting ? 'disabled' : ''}>Schedule</button>
					<button type="button" id="social-draft-btn" class="secondary" ${submitting ? 'disabled' : ''}>Save draft</button>
					${showRedditCopy ? `<button type="button" id="social-reddit-copy" class="secondary">Copy for Reddit</button>` : ''}
					<button type="button" id="social-open-dashboard" class="secondary">Open full composer</button>
					<button type="button" id="social-refresh" class="secondary">Refresh</button>
				</div>
				${displayError ? `<p class="error" role="alert">${escapeHtml(displayError)}</p>` : ''}
				${success ? `<p class="status success" role="status">${escapeHtml(success)}</p>` : ''}
				${redditComposerCopyMessage ? `<p class="status success" role="status">${escapeHtml(redditComposerCopyMessage)}</p>` : ''}
				<p class="footer">Reconnect or add channels under Account → Channels in the dashboard.</p>
			</div>
		`;

		teardownComposerWidgets();
		root.replaceChildren(el(composerHtml));

		const pickerHost = root.querySelector<HTMLElement>('#social-channel-picker');
		const activeSession = session;
		if (pickerHost && activeSession) {
			destroyChannelPicker = mountChannelPicker(pickerHost, {
				channels: loadedChannels,
				selectedIds: selectedChannelIds,
				selectedGroupId,
				session: activeSession,
				onSelectionChange: (ids) => {
					selectedChannelIds = ids;
					if (
						selectedGroupId &&
						!selectionMatchesGroup(loadedChannels, ids, selectedGroupId)
					) {
						selectedGroupId = null;
					}
					redditComposerCopyMessage = '';
					syncComposerPostPreview();
				},
				onSelectedGroupIdChange: (groupId) => {
					selectedGroupId = groupId;
				},
				onAddChannel: () => {
					void openDashboardAddChannel(activeSession.dashboardOrigin);
				},
			});
		}

		const bodyEl = root.querySelector<HTMLTextAreaElement>('#social-body');
		const toolbarHost = root.querySelector<HTMLElement>('#social-composer-toolbar');
		const mediaHost = root.querySelector<HTMLElement>('#social-composer-media');
		if (mediaHost) {
			destroyMediaStrip = mountComposerMediaStrip(mediaHost, {
				items: attachedMedia,
				uploading: mediaUploading,
				onRemove: (id) => {
					removeAttachedMedia(id);
					mediaUploadError = '';
					renderComposer();
				},
			});
		}

		const previewHost = root.querySelector<HTMLElement>('#social-composer-preview');
		if (previewHost && activeSession) {
			postPreviewController = mountComposerPostPreview(previewHost, {
				session: activeSession,
				channels: loadedChannels,
				selectedIds: selectedChannelIds,
				body: bodyDraft,
				attachedMedia,
			});
		}

		if (toolbarHost) {
			destroyComposerToolbar = mountComposerToolbar(toolbarHost, {
				getTextarea: () => root.querySelector<HTMLTextAreaElement>('#social-body'),
				onPickFiles: (files) => {
					handleComposerFilePick(files);
				},
				mediaPickDisabled:
					mediaUploading ||
					submitting ||
					attachedMedia.length >= MAX_COMPOSER_MEDIA_ATTACHMENTS,
			});
		}
		if (bodyEl) {
			bodyEl.value = bodyDraft;
			bodyEl.addEventListener('input', () => {
				bodyDraft = bodyEl.value;
				redditComposerCopyMessage = '';
				syncComposerPostPreview();
			});
		}

		const redditHost = root.querySelector('#social-reddit-action-needed');
		if (redditHost && activeSession) {
			redditActionNeeded = mountRedditActionNeeded(
				redditHost,
				() => session,
				() => {
					void refreshSafe();
				}
			);
		}

		root.querySelector('#social-reddit-copy')?.addEventListener('click', () => {
			const body = bodyEl?.value ?? bodyDraft;
			void copyTextToClipboard(buildRedditClipboardText({ body })).then((result) => {
				redditComposerCopyMessage = result.ok
					? (result.message ?? 'Copied for Reddit.')
					: (result.error ?? 'Could not copy.');
				renderComposer();
			});
		});

		root.querySelector('#social-open-dashboard')?.addEventListener('click', () => {
			const origin = session?.dashboardOrigin;
			if (origin) void openDashboardAppUrl(`${origin}/account`);
		});
		root.querySelector('#social-refresh')?.addEventListener('click', () => {
			void refresh();
		});

		const submit = async (
			status: 'scheduled' | 'draft',
			opts?: { scheduledAtIso: string; successLabel: string; scheduleLocalAfter?: string }
		) => {
			if (!session || submitting || mediaUploading) return;
			const body = bodyEl?.value ?? '';
			const scheduleInput = root.querySelector<HTMLInputElement>('#social-schedule')?.value ?? scheduleLocal;
			const scheduledAtIso =
				opts?.scheduledAtIso ?? datetimeLocalToIso(scheduleInput);
			if (!scheduledAtIso) {
				renderComposer('Schedule time is invalid.');
				return;
			}
			scheduleLocal = opts?.scheduleLocalAfter ?? scheduleInput;
			bodyDraft = body;
			submitting = true;
			mediaUploading = attachedMedia.length > 0;
			renderComposer();

			let mediaPayload: { id: string; path: string }[] = [];
			if (attachedMedia.length > 0) {
				const resolved = await resolveComposerMediaAttachments(session, attachedMedia);
				mediaUploading = false;
				if (!resolved.ok) {
					submitting = false;
					renderComposer(resolved.error);
					return;
				}
				attachedMedia = resolved.items;
				mediaPayload = resolved.media;
				renderComposer();
			} else {
				mediaUploading = false;
			}

			const result = await createSocialPost(session, {
				body,
				integrationIds: Array.from(selectedChannelIds),
				scheduledAtIso,
				status,
				media: mediaPayload,
			});
			submitting = false;
			mediaUploading = false;

			if (!result.ok) {
				renderComposer(result.error);
				return;
			}

			clearAttachedMedia();
			mediaUploadError = '';
			const label =
				opts?.successLabel ?? (status === 'draft' ? 'Draft saved.' : 'Post scheduled.');
			renderComposer(undefined, label);
			void redditActionNeeded?.refresh();
		};

		root.querySelector('#social-publish-now-btn')?.addEventListener('click', () => {
			const nowIso = new Date().toISOString();
			void submit('scheduled', {
				scheduledAtIso: nowIso,
				scheduleLocalAfter: isoToDatetimeLocalValue(nowIso),
				successLabel: 'Publishing now.',
			});
		});
		root.querySelector('#social-schedule-btn')?.addEventListener('click', () => {
			void submit('scheduled');
		});
		root.querySelector('#social-draft-btn')?.addEventListener('click', () => {
			void submit('draft');
		});
	}

	async function loadComposerData(): Promise<void> {
		const resolved = await resolveSocialSession();
		if (isSocialApiFailure(resolved)) {
			const auth = await isDashboardLoggedIn();
			if (!auth.loggedIn || getSessionSnapshot().status !== 'signed_in') {
				session = null;
				loadedChannels = [];
				selectedChannelIds = new Set();
				selectedGroupId = null;
				renderSignedOutPlaceholder();
				return;
			}
			renderSessionError(resolved.error);
			return;
		}

		session = resolved;

		const [channelsResult, slotResult] = await Promise.all([
			listSocialIntegrations(session),
			findSuggestedScheduleSlot(session),
		]);

		if (!channelsResult.ok) {
			loadedChannels = [];
			renderComposer(channelsResult.error);
			return;
		}

		if (slotResult.ok) {
			scheduleLocal =
				isoToDatetimeLocalValue(slotResult.scheduledAtIso) || defaultComposerScheduleLocal();
		} else {
			scheduleLocal = defaultComposerScheduleLocal();
		}

		const selectable = channelsResult.channels.filter(isSocialComposerChannel);
		if (selectedChannelIds.size === 0 && selectable.length > 0) {
			selectedChannelIds = new Set(selectable.map((ch) => ch.id));
		}

		loadedChannels = channelsResult.channels;
		renderComposer();
	}

	async function refresh(): Promise<void> {
		const snap = getSessionSnapshot();
		if (snap.status === 'checking') {
			renderLoading();
			return;
		}
		if (snap.status === 'signed_out') {
			session = null;
			loadedChannels = [];
			selectedChannelIds = new Set();
			selectedGroupId = null;
			renderSignedOutPlaceholder();
			return;
		}

		const pendingDraft = await peekSocialComposerDraft();
		renderLoading();
		session = null;
		try {
			await loadComposerData();
		} catch {
			const auth = await isDashboardLoggedIn().catch(() => ({
				loggedIn: false,
				loginUrl: 'https://www.openquok.com/sign-in',
			}));
			if (!auth.loggedIn) {
				renderSignedOutPlaceholder();
			} else {
				renderSessionError(
					'Could not reach OpenQuok. Check that the API is running, then try again.'
				);
			}
			return;
		}
		if (pendingDraft && session) {
			mediaUploadError = '';
			const applied = await applySocialComposerDraftWithMedia(session, pendingDraft, {
				existingAttachmentCount: attachedMedia.length,
			});
			bodyDraft = applied.body;
			if (applied.uploadedMedia) {
				attachedMedia = [...attachedMedia, applied.uploadedMedia];
			}
			mediaUploadError = applied.mediaUploadWarning ?? '';
			await clearSocialComposerDraft();
			renderComposer(mediaUploadError || undefined);
		}
	}

	let refreshInFlight = false;
	const refreshSafe = async (): Promise<void> => {
		if (refreshInFlight) return;
		refreshInFlight = true;
		try {
			await refresh();
		} finally {
			refreshInFlight = false;
		}
	};

	function onDashboardDisconnected(): void {
		clearAttachedMedia();
		session = null;
		loadedChannels = [];
		selectedChannelIds = new Set();
		selectedGroupId = null;
		submitting = false;
		mediaUploading = false;
		mediaUploadError = '';
		bodyDraft = '';
		if (getSessionSnapshot().status === 'signed_out') {
			renderSignedOutPlaceholder();
		} else {
			renderLoading();
		}
	}

	void refreshSafe();

	return {
		refresh: () => refreshSafe(),
		onDashboardDisconnected,
	};
}
