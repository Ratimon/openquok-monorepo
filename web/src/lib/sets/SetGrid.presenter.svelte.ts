import type { SetRowViewModel } from '$lib/sets/GetSet.presenter.svelte';
import type { SetSnapshotProgrammerModel } from '$lib/sets/Sets.repository.svelte';
import type { RepeatIntervalKey } from '$lib/posts';

import { formatDateShort } from '$lib/ui/helpers/formatters';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
import { socialProviderDisplayLabel, socialProviderEmoji } from '$data/social-providers';

import { parseSetContent } from '$lib/sets/Sets.repository.svelte';

/** One resolved channel row for templates grid (Channels column + tooltip). */
export type SetGridChannelSummaryVm = {
	integrationId: string;
	/** Channel display name or fallback when disconnected. */
	displayName: string;
	pictureUrl: string | null;
	/** Integration catalog identifier (instagram, threads, …). */
	providerIdentifier: string;
	/** Human platform label for grouping in tooltip. */
	platformLabel: string;
};

/** Compact cell + rich tooltip payload for the Channels column. */
export type SetGridChannelsDisplayVm = {
	total: number;
	/** Up to two entries shown as overlapping avatars in the grid cell. */
	preview: [SetGridChannelSummaryVm] | [SetGridChannelSummaryVm, SetGridChannelSummaryVm];
	/** `max(0, total - preview.length)` — rendered as "+N" in the cell. */
	restCount: number;
	/** Full ordered list for tooltip (same order as in the set). */
	all: SetGridChannelSummaryVm[];
};

export type SetGridChannelsTooltipGroupVm = {
	platformLabel: string;
	channels: SetGridChannelSummaryVm[];
};

/** One tag chip in the templates grid Tags column (resolved color from workspace tag list). */
export type SetGridTagChipVm = {
	name: string;
	color: string;
};

/** Minimal workspace tag row for resolving chip colors on the sets grid. */
export type SetGridTagLookupVm = {
	name: string;
	color?: string | null;
};

/** One row in the account → Templates (sets) SVAR grid. */
export type SetGridTableRowViewModel = {
	id: string;
	setRow: SetRowViewModel;
	name: string;
	channelsSummary: string;
	/** Structured channel list for custom cell + tooltip; null when content JSON is invalid. */
	channelsDisplay: SetGridChannelsDisplayVm | null;
	bodyPreview: string;
	/** Full plain-text body for grid hover (cell uses truncated {@link bodyPreview}). */
	bodyPreviewTooltip: string;
	tagsSummary: string;
	/** Tags column chips; empty when the set has no tags. */
	tagsDisplay: readonly SetGridTagChipVm[];
	threadsSummary: string;
	mediaSummary: string;
	repeatSummary: string;
	updatedDisplay: string;
};

const DASH = '—';

/** Matches {@link TagsComponent} default when a tag has no stored color. */
const DEFAULT_TAG_COLOR = '#6366f1';

function tagColorByName(tags: readonly SetGridTagLookupVm[]): Map<string, string> {
	const m = new Map<string, string>();
	for (const t of tags) {
		const name = String(t.name ?? '').trim();
		if (!name) continue;
		const c = String(t.color ?? '').trim();
		m.set(name, c.length ? c : DEFAULT_TAG_COLOR);
	}
	return m;
}

export function buildSetGridTagsDisplayVm(
	selectedNames: readonly string[],
	workspaceTags: readonly SetGridTagLookupVm[]
): SetGridTagChipVm[] {
	const byName = tagColorByName(workspaceTags);
	return selectedNames.map((raw) => {
		const name = String(raw ?? '').trim();
		return { name, color: byName.get(name) ?? DEFAULT_TAG_COLOR };
	});
}

function truncate(text: string, maxLen: number): string {
	const t = text.trim();
	if (!t.length) return DASH;
	if (t.length <= maxLen) return t;
	return `${t.slice(0, Math.max(0, maxLen - 1))}…`;
}

function repeatIntervalLabel(key: RepeatIntervalKey | null): string {
	if (key === null) return 'None';
	const labels: Record<RepeatIntervalKey, string> = {
		day: 'Daily',
		two_days: 'Every 2 days',
		three_days: 'Every 3 days',
		four_days: 'Every 4 days',
		five_days: 'Every 5 days',
		six_days: 'Every 6 days',
		week: 'Weekly',
		two_weeks: 'Every 2 weeks',
		month: 'Monthly'
	};
	return labels[key] ?? key;
}

function countFollowUpRepliesInBucket(settings: Record<string, unknown>, bucket: 'threads' | 'instagram'): number {
	const sub = settings[bucket];
	if (!sub || typeof sub !== 'object' || Array.isArray(sub)) return 0;
	const replies = (sub as Record<string, unknown>).replies;
	return Array.isArray(replies) ? replies.length : 0;
}

function countThreadsAutoReplies(
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>
): number {
	let n = 0;
	for (const settings of Object.values(providerSettingsByIntegrationId)) {
		n += countFollowUpRepliesInBucket(settings, 'threads');
		n += countFollowUpRepliesInBucket(settings, 'instagram');
	}
	return n;
}

function channelSupportsFollowUpComments(identifier: string): boolean {
	const id = identifier.trim().toLowerCase();
	return id === 'threads' || id.startsWith('instagram');
}

/** Matches composer bucket routing for persisted `providerSettings` (Threads vs Instagram keys). */
function followUpBucketForIdentifier(identifier: string): 'threads' | 'instagram' {
	const id = identifier.trim().toLowerCase();
	return id.startsWith('instagram') ? 'instagram' : 'threads';
}

function parseFollowUpReplyMessagesFromBucket(block: unknown): string[] {
	if (!block || typeof block !== 'object' || Array.isArray(block)) return [];
	const rep = (block as Record<string, unknown>).replies;
	if (!Array.isArray(rep)) return [];
	const out: string[] = [];
	for (const item of rep) {
		if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
		const msg = stripHtmlToPlainText(String((item as Record<string, unknown>).message ?? '')).trim();
		if (msg.length) out.push(msg);
	}
	return out;
}

/** Plain multiline text for SVAR Auto-replies column tooltip (channels-style: total, then platform + bullets). */
export function buildSetsGridThreadsRepliesTooltipPlainText(
	vm: SetGridTableRowViewModel,
	channels: readonly SetGridChannelLookupVm[]
): string {
	const head = String(vm.threadsSummary ?? '').trim() || 'Auto-replies';
	if (head === DASH) return head;
	const snap = parseSetContent(vm.setRow.content);
	if (!snap) return head;

	type Row = {
		platformLabel: string;
		providerIdentifier: string;
		displayName: string;
		messages: string[];
	};
	const byId = channelByIdRecord(channels);
	const perIntegration: Row[] = [];
	for (const integrationId of snap.selectedIntegrationIds) {
		const id = String(integrationId ?? '').trim();
		if (!id) continue;
		const ch = byId[id];
		const identifier = String(ch?.identifier ?? '').trim() || 'generic';
		if (!channelSupportsFollowUpComments(identifier)) continue;
		const bucket = followUpBucketForIdentifier(identifier);
		const settings = snap.providerSettingsByIntegrationId[id] ?? {};
		const messages = parseFollowUpReplyMessagesFromBucket((settings as Record<string, unknown>)[bucket]);
		if (messages.length === 0) continue;
		perIntegration.push({
			platformLabel: socialProviderDisplayLabel(identifier),
			providerIdentifier: identifier,
			displayName: (ch?.name ?? '').trim() || 'Unknown channel',
			messages
		});
	}
	if (perIntegration.length === 0) return head;

	const buckets: Record<string, Row[]> = {};
	for (const r of perIntegration) {
		if (!buckets[r.platformLabel]) buckets[r.platformLabel] = [];
		buckets[r.platformLabel]!.push(r);
	}
	const groups = Object.entries(buckets)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([, rows]) => rows);

	const lines: string[] = [head];
	for (const rows of groups) {
		const id0 = rows[0]?.providerIdentifier ?? 'threads';
		lines.push(`${socialProviderEmoji(id0)} ${rows[0]!.platformLabel}`);
		const multiAccount = rows.length > 1;
		for (const row of rows) {
			const prefix = multiAccount ? `${row.displayName}: ` : '';
			for (const msg of row.messages) {
				lines.push(`  • ${prefix}${msg}`);
			}
		}
	}
	return lines.join('\n');
}

/** Grid cell copy (tooltips stay full-length); larger cap so multiline + `autoRowHeight` rows stay useful */
const BODY_PREVIEW_GRID_MAX_CHARS = 420;

function bodyPreviewFromSnapshot(snap: SetSnapshotProgrammerModel): string {
	if (snap.mode === 'global') {
		return truncate(snap.globalBody, BODY_PREVIEW_GRID_MAX_CHARS);
	}
	const first = Object.values(snap.bodiesByIntegrationId).find((b) => (b ?? '').trim().length);
	return truncate(first ?? snap.globalBody, BODY_PREVIEW_GRID_MAX_CHARS);
}

/** Untruncated plain body for tooltips (same source as {@link bodyPreviewFromSnapshot}). */
function bodyPreviewTooltipFromSnapshot(snap: SetSnapshotProgrammerModel): string {
	if (snap.mode === 'global') {
		const t = stripHtmlToPlainText(String(snap.globalBody ?? '')).trim();
		return t.length ? t : DASH;
	}
	const first = Object.values(snap.bodiesByIntegrationId).find((b) => (b ?? '').trim().length);
	const t = stripHtmlToPlainText(String(first ?? snap.globalBody ?? '')).trim();
	return t.length ? t : DASH;
}

/** Minimal channel fields from dashboard list — keeps this presenter free of dashboard imports. */
export type SetGridChannelLookupVm = {
	id: string;
	/** Provider row id when it differs from {@link id} — some payloads key integrations by either. */
	internalId?: string | null;
	name: string;
	identifier: string;
	picture: string | null;
};

function channelByIdRecord(channels: readonly SetGridChannelLookupVm[]): Record<string, SetGridChannelLookupVm> {
	const m: Record<string, SetGridChannelLookupVm> = {};
	for (const c of channels) {
		const id = String(c.id ?? '').trim();
		if (id) m[id] = c;
		const intId = String(c.internalId ?? '').trim();
		if (intId && intId !== id) m[intId] = c;
	}
	return m;
}

/** Builds channel summary VMs from set snapshot + workspace channel list (unknown ids still listed). */
export function buildSetGridChannelsDisplayVm(
	snap: SetSnapshotProgrammerModel,
	channels: readonly SetGridChannelLookupVm[]
): SetGridChannelsDisplayVm | null {
	const byId = channelByIdRecord(channels);
	const all: SetGridChannelSummaryVm[] = [];
	for (const integrationId of snap.selectedIntegrationIds) {
		const id = String(integrationId ?? '').trim();
		if (!id) continue;
		const ch = byId[id];
		const identifier = String(ch?.identifier ?? '').trim() || 'generic';
		const platformLabel = socialProviderDisplayLabel(identifier);
		all.push({
			integrationId: id,
			displayName: (ch?.name ?? '').trim() || 'Unknown channel',
			pictureUrl: ch?.picture ?? null,
			providerIdentifier: identifier,
			platformLabel
		});
	}
	const total = all.length;
	if (total === 0) return null;
	const preview =
		total === 1 ? ([all[0]!] as [SetGridChannelSummaryVm]) : ([all[0]!, all[1]!] as [SetGridChannelSummaryVm, SetGridChannelSummaryVm]);
	const restCount = Math.max(0, total - preview.length);
	return { total, preview, restCount, all };
}

/** Groups channels for tooltip sections (stable platform label sort). */
export function groupSetGridChannelsForTooltipVm(
	display: SetGridChannelsDisplayVm
): SetGridChannelsTooltipGroupVm[] {
	const buckets: Record<string, SetGridChannelSummaryVm[]> = {};
	for (const c of display.all) {
		const key = c.platformLabel;
		if (!buckets[key]) buckets[key] = [];
		buckets[key]!.push(c);
	}
	return Object.entries(buckets)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([platformLabel, chs]) => ({ platformLabel, channels: chs }));
}

/** Plain multiline text for default SVAR column `tooltip` (channels column). */
export function buildSetsGridChannelsTooltipPlainText(vm: SetGridTableRowViewModel): string {
	const head = String(vm.channelsSummary ?? '').trim() || 'Channels';
	const d = vm.channelsDisplay;
	if (!d) return head;
	const groups = groupSetGridChannelsForTooltipVm(d);
	const lines: string[] = [head];
	for (const g of groups) {
		const id0 = g.channels[0]?.providerIdentifier ?? '';
		lines.push(`${socialProviderEmoji(id0)} ${g.platformLabel}`);
		for (const ch of g.channels) {
			lines.push(`  • ${ch.displayName}`);
		}
	}
	return lines.join('\n');
}

/**
 * Maps a persisted set row + parsed `content` JSON into SVAR grid columns.
 */
export function toSetGridTableRowViewModel(
	row: SetRowViewModel,
	channels: readonly SetGridChannelLookupVm[],
	workspaceTags: readonly SetGridTagLookupVm[] = []
): SetGridTableRowViewModel {
	const snap = parseSetContent(row.content);

	if (!snap) {
		return {
			id: row.id,
			setRow: row,
			name: row.name,
			channelsSummary: DASH,
			channelsDisplay: null,
			bodyPreview: 'Unsupported or invalid content JSON',
			bodyPreviewTooltip: 'Unsupported or invalid content JSON',
			tagsSummary: DASH,
			tagsDisplay: [],
			threadsSummary: DASH,
			mediaSummary: DASH,
			repeatSummary: DASH,
			updatedDisplay: formatDateShort(row.updatedAt)
		};
	}

	const nChannels = snap.selectedIntegrationIds.length;
	const channelsSummary = nChannels === 0 ? 'No channels' : `${nChannels} channel${nChannels === 1 ? '' : 's'}`;
	const channelsDisplay = nChannels === 0 ? null : buildSetGridChannelsDisplayVm(snap, channels);

	const nTags = snap.selectedTagNames.length;
	const tagsSummary = nTags === 0 ? DASH : snap.selectedTagNames.join(', ');
	const tagsDisplay =
		nTags === 0 ? [] : buildSetGridTagsDisplayVm(snap.selectedTagNames, workspaceTags);

	const nReplies = countThreadsAutoReplies(snap.providerSettingsByIntegrationId);
	const threadsSummary =
		nReplies === 0 ? DASH : `${nReplies} auto-repl${nReplies === 1 ? 'y' : 'ies'}`;

	const nMedia = snap.postMediaItems.length;
	const mediaSummary = nMedia === 0 ? DASH : `${nMedia} attachment${nMedia === 1 ? '' : 's'}`;

	return {
		id: row.id,
		setRow: row,
		name: row.name,
		channelsSummary,
		channelsDisplay,
		bodyPreview: bodyPreviewFromSnapshot(snap),
		bodyPreviewTooltip: bodyPreviewTooltipFromSnapshot(snap),
		tagsSummary: truncate(tagsSummary, 80),
		tagsDisplay,
		threadsSummary,
		mediaSummary,
		repeatSummary: repeatIntervalLabel(snap.repeatInterval),
		updatedDisplay: formatDateShort(row.updatedAt)
	};
}

export function sortSetGridRows(rows: SetGridTableRowViewModel[]): SetGridTableRowViewModel[] {
	return [...rows].sort((a, b) => a.name.localeCompare(b.name));
}
