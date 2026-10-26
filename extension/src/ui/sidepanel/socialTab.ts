import { inferMediaMimeType, validateMediaFileUploadSize } from 'openquok-common';

import { formatSocialConnectionLabel } from '../../shared/dashboardConnectionLabel.js';
import { rememberDashboardOrigin } from '../../shared/dashboardOriginStorage.js';
import { clearPausedSocialDashboardOrigin } from '../../shared/dashboardSocialDisconnect.js';
import { hasDashboardSessionCookie, isDashboardLoggedIn } from '../../shared/dashboardAuth.js';
import { listAuthCheckOriginsForDashboard } from '../../shared/dashboardApiOrigin.js';
import {
	requestDashboardSessionSyncFromOpenTabs,
	waitMs,
} from '../../shared/requestDashboardSessionSync.js';
import {
	detachSocialDashboardExtension,
	disconnectSocialDashboardSession,
} from '../../shared/dashboardSocialDisconnect.js';
import { installSocialSessionWatch } from '../../shared/socialSessionWatch.js';
import {
	DEFAULT_SELF_HOST_DASHBOARD_INPUT,
	normalizeSelfHostDashboardInput,
	openDashboardAddChannel,
	openDashboardAppUrl,
	openDashboardUrl,
	parseDashboardSignInInput,
	PRODUCTION_DASHBOARD_SIGN_IN_URL,
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
import { mountChannelPicker } from './channelPicker.js';
import { mountComposerMediaStrip } from './composerMediaStrip.js';
import { mountComposerPostPreview } from './composerPostPreview.js';
import { mountComposerToolbar } from './composerToolbar.js';
import { el, escapeHtml } from './uiHelpers.js';

export type SocialTabController = {
	refresh: () => Promise<void>;
};

function isSocialApiFailure(
	value: SocialSessionContext | SocialApiFailure
): value is SocialApiFailure {
	return 'ok' in value && value.ok === false;
}

export function mountSocialTab(root: HTMLElement): SocialTabController {
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
	let selfHostInput = DEFAULT_SELF_HOST_DASHBOARD_INPUT;
	let gateError = '';
	let destroyChannelPicker: (() => void) | null = null;
	let destroyComposerToolbar: (() => void) | null = null;
	let destroyMediaStrip: (() => void) | null = null;
	let postPreviewController: ReturnType<typeof mountComposerPostPreview> | null = null;

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

	function applySelfHostFieldNormalization(raw: string): string {
		const normalized = normalizeSelfHostDashboardInput(raw);
		selfHostInput = normalized;
		return normalized;
	}

	async function dashboardSessionExistsForSelfHostInput(raw: string): Promise<boolean> {
		const signInUrl = parseDashboardSignInInput(raw);
		if (!signInUrl) return false;
		const origin = new URL(signInUrl).origin;
		for (const checkOrigin of listAuthCheckOriginsForDashboard(origin)) {
			if (await hasDashboardSessionCookie(checkOrigin)) return true;
		}
		return false;
	}

	async function connectSelfHostDashboard(raw: string): Promise<void> {
		const normalized = applySelfHostFieldNormalization(raw);
		const signInUrl = parseDashboardSignInInput(normalized);
		if (!signInUrl) {
			gateError = 'Enter a valid dashboard URL (e.g. https://localhost:5173).';
			renderGate();
			return;
		}
		gateError = '';
		await prepareSelfHostReconnectHints();
		if (await dashboardSessionExistsForSelfHostInput(normalized)) {
			await refresh();
			return;
		}
		await openDashboardUrl(normalized);
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
	}

	function renderGate(): void {
		teardownComposerWidgets();
		root.replaceChildren(
			el(`
				<div class="wrap tab-wrap">
					<div class="gate-card">
						<strong>Connect to OpenQuok</strong>
						<p class="muted">Sign in on the dashboard to schedule posts and pick connected channels.</p>
						<button type="button" id="social-sign-in-cloud" class="primary">Connect to OpenQuok.com</button>
						<div class="gate-selfhost">
							<label class="field-label" for="social-selfhost-url">Self host</label>
							<input
								id="social-selfhost-url"
								class="gate-selfhost-input"
								type="text"
								spellcheck="false"
								autocomplete="off"
								placeholder="https://localhost:5173"
								value="${escapeHtml(selfHostInput)}"
							/>
							<button type="button" id="social-sign-in-selfhost" class="secondary">Connect to self host</button>
						</div>
						${gateError ? `<p class="error" role="alert">${escapeHtml(gateError)}</p>` : ''}
						<button type="button" id="social-gate-refresh" class="secondary gate-refresh">Refresh after sign-in</button>
					</div>
					<p class="footer">After you sign in on the dashboard, this panel updates automatically. OAuth and credential channels are connected in the dashboard — not in the extension.</p>
				</div>
			`)
		);

		const selfHostEl = root.querySelector<HTMLInputElement>('#social-selfhost-url');
		if (selfHostEl) {
			selfHostEl.addEventListener('input', () => {
				selfHostInput = selfHostEl.value;
				gateError = '';
			});
			selfHostEl.addEventListener('blur', () => {
				const normalized = applySelfHostFieldNormalization(selfHostEl.value);
				if (normalized !== selfHostEl.value) {
					selfHostEl.value = normalized;
				}
			});
		}

		root.querySelector('#social-sign-in-cloud')?.addEventListener('click', () => {
			gateError = '';
			void openDashboardUrl(PRODUCTION_DASHBOARD_SIGN_IN_URL);
		});

		root.querySelector('#social-gate-refresh')?.addEventListener('click', () => {
			void prepareSelfHostReconnectHints().then(() => refresh());
		});

		root.querySelector('#social-sign-in-selfhost')?.addEventListener('click', () => {
			void connectSelfHostDashboard(selfHostEl?.value ?? selfHostInput);
		});
	}

	async function prepareSelfHostReconnectHints(): Promise<void> {
		const signInUrl = parseDashboardSignInInput(applySelfHostFieldNormalization(selfHostInput));
		if (!signInUrl) return;
		try {
			const origin = new URL(signInUrl).origin;
			await rememberDashboardOrigin(origin);
			await clearPausedSocialDashboardOrigin(origin);
		} catch {
			/* ignore */
		}
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
					const signInUrl = parseDashboardSignInInput(selfHostInput);
					if (signInUrl) origin = new URL(signInUrl).origin;
				}
				if (!origin) {
					const auth = await isDashboardLoggedIn();
					origin = new URL(auth.loginUrl).origin;
				}
				await detachSocialDashboardExtension(origin);
				session = null;
				loadedChannels = [];
				selectedChannelIds = new Set();
				selectedGroupId = null;
				renderGate();
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

	function renderComposer(error?: string, success?: string): void {
		if (!session) return;

		const displayError =
			[error, mediaUploadError].filter((part) => part?.trim()).join(' ') || undefined;

		const connectionLabel = formatSocialConnectionLabel(session.dashboardOrigin);

		const composerHtml = `
			<div class="wrap tab-wrap">
				<div class="connection-bar" role="status">
					<span class="connection-label">${escapeHtml(connectionLabel)}</span>
					<button type="button" id="social-disconnect" class="connection-disconnect secondary">Disconnect</button>
				</div>
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
					<button type="button" id="social-open-dashboard" class="secondary">Open full composer</button>
					<button type="button" id="social-refresh" class="secondary">Refresh</button>
				</div>
				${displayError ? `<p class="error" role="alert">${escapeHtml(displayError)}</p>` : ''}
				${success ? `<p class="status success" role="status">${escapeHtml(success)}</p>` : ''}
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
				syncComposerPostPreview();
			});
		}

		root.querySelector('#social-disconnect')?.addEventListener('click', () => {
			if (!session || submitting) return;
			submitting = true;
			void disconnectSocialDashboardSession({
				dashboardOrigin: session.dashboardOrigin,
				apiOrigin: session.apiOrigin,
				accessToken: session.accessToken,
			})
				.then(() => {
					clearAttachedMedia();
					session = null;
					loadedChannels = [];
					selectedChannelIds = new Set();
					selectedGroupId = null;
					submitting = false;
					renderGate();
				})
				.catch(() => {
					submitting = false;
					renderComposer('Could not disconnect. Try again or sign out in the dashboard.');
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
			if (!auth.loggedIn) {
				session = null;
				loadedChannels = [];
				selectedChannelIds = new Set();
				selectedGroupId = null;
				renderGate();
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

	async function refresh(options?: { requestDashboardSync?: boolean }): Promise<void> {
		applySelfHostFieldNormalization(selfHostInput);
		if (options?.requestDashboardSync) {
			await requestDashboardSessionSyncFromOpenTabs();
			await waitMs(400);
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
				renderGate();
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
	const refreshSafe = async (options?: { requestDashboardSync?: boolean }): Promise<void> => {
		if (refreshInFlight) return;
		refreshInFlight = true;
		try {
			await refresh(options);
		} finally {
			refreshInFlight = false;
		}
	};

	void refreshSafe({ requestDashboardSync: true });
	installSocialSessionWatch(() => {
		void refreshSafe({ requestDashboardSync: false });
	});

	return {
		refresh: () => refreshSafe({ requestDashboardSync: true }),
	};
}
