import { isDashboardLoggedIn } from '../../shared/dashboardAuth.js';
import { installSocialSessionWatch } from '../../shared/socialSessionWatch.js';
import {
	DEFAULT_SELF_HOST_DASHBOARD_INPUT,
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
	type SocialIntegrationChannel,
	type SocialSessionContext,
} from '../../social/openquokSocialApi.js';
import {
	applySocialComposerDraftToBody,
	clearSocialComposerDraft,
	peekSocialComposerDraft,
} from '../../social/sessionDraftStorage.js';

import { el, escapeHtml } from './uiHelpers.js';

export type SocialTabController = {
	refresh: () => Promise<void>;
};

function isSocialApiFailure(
	value: SocialSessionContext | SocialApiFailure
): value is SocialApiFailure {
	return 'ok' in value && value.ok === false;
}

function channelCheckboxList(channels: SocialIntegrationChannel[], selectedIds: Set<string>): string {
	if (channels.length === 0) {
		return '<p class="muted">No social channels connected. Add channels in the dashboard.</p>';
	}

	const rows = channels
		.map((channel) => {
			const schedulable = isSocialComposerChannel(channel);
			const checked = selectedIds.has(channel.id) ? ' checked' : '';
			const disabled = schedulable ? '' : ' disabled';
			const hint = schedulable
				? ''
				: channel.refreshNeeded
					? ' — refresh needed'
					: channel.inBetweenSteps
						? ' — finish connect in dashboard'
						: channel.disabled
							? ' — disabled'
							: ' — unavailable';
			return `
				<label class="channel-row${schedulable ? '' : ' channel-row-muted'}">
					<input type="checkbox" class="channel-check" value="${escapeHtml(channel.id)}"${checked}${disabled} />
					<span>${escapeHtml(channel.name)} <span class="channel-id">${escapeHtml(channel.identifier)}</span>${escapeHtml(hint)}</span>
				</label>
			`;
		})
		.join('');

	return `<div class="channel-list" role="group" aria-label="Channels">${rows}</div>`;
}

export function mountSocialTab(root: HTMLElement): SocialTabController {
	let session: SocialSessionContext | null = null;
	let loadedChannels: SocialIntegrationChannel[] = [];
	let scheduleLocal = defaultComposerScheduleLocal();
	let selectedChannelIds = new Set<string>();
	let bodyDraft = '';
	let submitting = false;
	let selfHostInput = DEFAULT_SELF_HOST_DASHBOARD_INPUT;
	let gateError = '';

	function readSelectedChannels(): string[] {
		const boxes = root.querySelectorAll<HTMLInputElement>('.channel-check:checked');
		return Array.from(boxes).map((box) => box.value).filter(Boolean);
	}

	function renderGate(): void {
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
								placeholder="localhost:5173"
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
		}

		root.querySelector('#social-sign-in-cloud')?.addEventListener('click', () => {
			gateError = '';
			void openDashboardUrl(PRODUCTION_DASHBOARD_SIGN_IN_URL);
		});

		root.querySelector('#social-gate-refresh')?.addEventListener('click', () => {
			void refresh();
		});

		root.querySelector('#social-sign-in-selfhost')?.addEventListener('click', () => {
			const raw = selfHostEl?.value ?? selfHostInput;
			selfHostInput = raw;
			const signInUrl = parseDashboardSignInInput(raw);
			if (!signInUrl) {
				gateError = 'Enter a valid dashboard URL (e.g. localhost:5173).';
				renderGate();
				return;
			}
			gateError = '';
			void openDashboardUrl(signInUrl);
		});
	}

	function renderLoading(): void {
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

		const composerHtml = `
			<div class="wrap tab-wrap">
				<div class="card">
					<strong>Compose</strong>
					<p class="muted">Schedule via your OpenQuok session — tokens stay on the server.</p>
				</div>
				<label class="field-label" for="social-body">Post</label>
				<textarea id="social-body" class="composer-body" rows="5" placeholder="What do you want to share?"></textarea>
				<label class="field-label">Channels</label>
				${channelCheckboxList(loadedChannels, selectedChannelIds)}
				<label class="field-label" for="social-schedule">Schedule time</label>
				<input id="social-schedule" class="composer-schedule" type="datetime-local" value="${escapeHtml(scheduleLocal)}" />
				<div class="actions composer-actions">
					<button type="button" id="social-publish-now-btn" class="primary" ${submitting ? 'disabled' : ''}>Publish now</button>
					<button type="button" id="social-schedule-btn" class="primary" ${submitting ? 'disabled' : ''}>Schedule</button>
					<button type="button" id="social-draft-btn" class="secondary" ${submitting ? 'disabled' : ''}>Save draft</button>
					<button type="button" id="social-open-dashboard" class="secondary">Open full composer</button>
					<button type="button" id="social-refresh" class="secondary">Refresh</button>
				</div>
				${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ''}
				${success ? `<p class="status success" role="status">${escapeHtml(success)}</p>` : ''}
				<p class="footer muted">Environment: ${escapeHtml(session.dashboardOrigin)}</p>
				<p class="footer">Reconnect or add channels under Account → Channels in the dashboard. For local dev, keep your <code>localhost:5173</code> tab focused and tap Refresh.</p>
			</div>
		`;

		root.replaceChildren(el(composerHtml));

		const bodyEl = root.querySelector<HTMLTextAreaElement>('#social-body');
		if (bodyEl) {
			bodyEl.value = bodyDraft;
			bodyEl.addEventListener('input', () => {
				bodyDraft = bodyEl.value;
			});
		}

		root.querySelectorAll<HTMLInputElement>('.channel-check').forEach((box) => {
			box.addEventListener('change', () => {
				if (box.checked) selectedChannelIds.add(box.value);
				else selectedChannelIds.delete(box.value);
			});
		});

		root.querySelector('#social-open-dashboard')?.addEventListener('click', () => {
			const origin = session?.dashboardOrigin;
			if (origin) void openDashboardUrl(`${origin}/account`);
		});
		root.querySelector('#social-refresh')?.addEventListener('click', () => {
			void refresh();
		});

		const submit = async (
			status: 'scheduled' | 'draft',
			opts?: { scheduledAtIso: string; successLabel: string; scheduleLocalAfter?: string }
		) => {
			if (!session || submitting) return;
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
			renderComposer();

			const result = await createSocialPost(session, {
				body,
				integrationIds: readSelectedChannels(),
				scheduledAtIso,
				status,
			});
			submitting = false;

			if (!result.ok) {
				renderComposer(result.error);
				return;
			}

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
				renderGate();
				return;
			}
			renderComposer(resolved.error);
			return;
		}

		session = resolved;

		const [channelsResult, slotResult] = await Promise.all([
			listSocialIntegrations(session),
			findSuggestedScheduleSlot(session),
		]);

		if (!channelsResult.ok) {
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
				renderComposer('Could not reach OpenQuok. Check that the API is running, then try again.');
			}
			return;
		}
		if (pendingDraft && session) {
			bodyDraft = applySocialComposerDraftToBody(pendingDraft);
			await clearSocialComposerDraft();
			renderComposer();
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

	void refreshSafe();
	installSocialSessionWatch(() => {
		void refreshSafe();
	});

	return { refresh: refreshSafe };
}
