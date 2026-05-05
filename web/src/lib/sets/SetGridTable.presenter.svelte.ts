import type { IApi, IColumn } from '@svar-ui/svelte-grid';

import type { GetSetPresenter, SetRowViewModel } from '$lib/sets/GetSet.presenter.svelte';
import type { SetSnapshotProgrammerModel } from '$lib/sets/Sets.repository.svelte';
import type { RepeatIntervalKey } from '$lib/posts';
import type { ProtectedDashboardPagePresenter } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

import { tick } from 'svelte';
import { formatDateShort } from '$lib/ui/helpers/formatters';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';
import { socialProviderDisplayLabel, socialProviderEmoji } from '$data/social-providers';

import { parseSetContent } from '$lib/sets/Sets.repository.svelte';

import SetsGridActionsCell from '$lib/ui/components/sets/SetsGridActionsCell.svelte';
import SetsGridChannelsCell from '$lib/ui/components/sets/SetsGridChannelsCell.svelte';
import SetsGridTagsCell from '$lib/ui/components/sets/SetsGridTagsCell.svelte';


/** One resolved channel row for templates grid (Channels column + tooltip). */
export type SetGridChannelSummaryViewModel = {
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
export type SetGridChannelsDisplayViewModel = {
	total: number;
	/** Up to two entries shown as overlapping avatars in the grid cell. */
	previewVm: [SetGridChannelSummaryViewModel] | [SetGridChannelSummaryViewModel, SetGridChannelSummaryViewModel];
	/** `max(0, total - previewVm.length)` — rendered as "+N" in the cell. */
	restCount: number;
	/** Full ordered list for tooltip (same order as in the set). */
	allVm: SetGridChannelSummaryViewModel[];
};

export type SetGridChannelsTooltipGroupViewModel = {
	platformLabel: string;
	channelsVm: SetGridChannelSummaryViewModel[];
};

/** One tag chip in the templates grid Tags column (resolved color from workspace tag list). */
export type SetGridTagChipViewModel = {
	name: string;
	color: string;
};

/** Minimal workspace tag row for resolving chip colors on the sets grid. */
export type SetGridTagLookupViewModel = {
	name: string;
	color?: string | null;
};

/** One row in the account → Templates (sets) SVAR grid. */
export type SetGridTableRowViewModel = {
	id: string;
	setRowVm: SetRowViewModel;
	name: string;
	channelsSummary: string;
	/** Structured channel list for custom cell + tooltip; null when content JSON is invalid. */
	channelsDisplayVm: SetGridChannelsDisplayViewModel | null;
	bodyPreview: string;
	/** Full plain-text body for grid hover (cell uses truncated {@link bodyPreview}). */
	bodyPreviewTooltip: string;
	tagsSummary: string;
	/** Tags column chips; empty when the set has no tags. */
	tagsDisplayVm: readonly SetGridTagChipViewModel[];
	threadsSummary: string;
	mediaSummary: string;
	repeatSummary: string;
	updatedDisplay: string;
};

const DASH = '—';

/** Matches {@link TagsComponent} default when a tag has no stored color. */
const DEFAULT_TAG_COLOR = '#6366f1';

function tagColorByName(tags: readonly SetGridTagLookupViewModel[]): Map<string, string> {
	const m = new Map<string, string>();
	for (const t of tags) {
		const name = String(t.name ?? '').trim();
		if (!name) continue;
		const c = String(t.color ?? '').trim();
		m.set(name, c.length ? c : DEFAULT_TAG_COLOR);
	}
	return m;
}

export function buildSetGridTagsDisplayViewModel(
	selectedNames: readonly string[],
	workspaceTags: readonly SetGridTagLookupViewModel[]
): SetGridTagChipViewModel[] {
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
	channels: readonly SetGridChannelLookupViewModel[]
): string {
	const head = String(vm.threadsSummary ?? '').trim() || 'Auto-replies';
	if (head === DASH) return head;
	const snap = parseSetContent(vm.setRowVm.content);
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
export type SetGridChannelLookupViewModel = {
	id: string;
	/** Provider row id when it differs from {@link id} — some payloads key integrations by either. */
	internalId?: string | null;
	name: string;
	identifier: string;
	picture: string | null;
};

function channelByIdRecord(channels: readonly SetGridChannelLookupViewModel[]): Record<string, SetGridChannelLookupViewModel> {
	const m: Record<string, SetGridChannelLookupViewModel> = {};
	for (const c of channels) {
		const id = String(c.id ?? '').trim();
		if (id) m[id] = c;
		const intId = String(c.internalId ?? '').trim();
		if (intId && intId !== id) m[intId] = c;
	}
	return m;
}

/** Builds channel summary view models from set snapshot + workspace channel list (unknown ids still listed). */
export function buildSetGridChannelsDisplayViewModel(
	snap: SetSnapshotProgrammerModel,
	channels: readonly SetGridChannelLookupViewModel[]
): SetGridChannelsDisplayViewModel | null {
	const byId = channelByIdRecord(channels);
	const allVm: SetGridChannelSummaryViewModel[] = [];
	for (const integrationId of snap.selectedIntegrationIds) {
		const id = String(integrationId ?? '').trim();
		if (!id) continue;
		const ch = byId[id];
		const identifier = String(ch?.identifier ?? '').trim() || 'generic';
		const platformLabel = socialProviderDisplayLabel(identifier);
		allVm.push({
			integrationId: id,
			displayName: (ch?.name ?? '').trim() || 'Unknown channel',
			pictureUrl: ch?.picture ?? null,
			providerIdentifier: identifier,
			platformLabel
		});
	}
	const total = allVm.length;
	if (total === 0) return null;
	const previewVm =
		total === 1
			? ([allVm[0]!] as [SetGridChannelSummaryViewModel])
			: ([allVm[0]!, allVm[1]!] as [SetGridChannelSummaryViewModel, SetGridChannelSummaryViewModel]);
	const restCount = Math.max(0, total - previewVm.length);
	return { total, previewVm, restCount, allVm };
}

/** Groups channels for tooltip sections (stable platform label sort). */
export function groupSetGridChannelsForTooltipViewModel(
	display: SetGridChannelsDisplayViewModel
): SetGridChannelsTooltipGroupViewModel[] {
	const buckets: Record<string, SetGridChannelSummaryViewModel[]> = {};
	for (const c of display.allVm) {
		const key = c.platformLabel;
		if (!buckets[key]) buckets[key] = [];
		buckets[key]!.push(c);
	}
	return Object.entries(buckets)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([platformLabel, chs]) => ({ platformLabel, channelsVm: chs }));
}

/** Plain multiline text for default SVAR column `tooltip` (channels column). */
export function buildSetsGridChannelsTooltipPlainText(vm: SetGridTableRowViewModel): string {
	const head = String(vm.channelsSummary ?? '').trim() || 'Channels';
	const d = vm.channelsDisplayVm;
	if (!d) return head;
	const groups = groupSetGridChannelsForTooltipViewModel(d);
	const lines: string[] = [head];
	for (const g of groups) {
		const id0 = g.channelsVm[0]?.providerIdentifier ?? '';
		lines.push(`${socialProviderEmoji(id0)} ${g.platformLabel}`);
		for (const ch of g.channelsVm) {
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
	channels: readonly SetGridChannelLookupViewModel[],
	workspaceTags: readonly SetGridTagLookupViewModel[] = []
): SetGridTableRowViewModel {
	const snap = parseSetContent(row.content);

	if (!snap) {
		return {
			id: row.id,
			setRowVm: row,
			name: row.name,
			channelsSummary: DASH,
			channelsDisplayVm: null,
			bodyPreview: 'Unsupported or invalid content JSON',
			bodyPreviewTooltip: 'Unsupported or invalid content JSON',
			tagsSummary: DASH,
			tagsDisplayVm: [],
			threadsSummary: DASH,
			mediaSummary: DASH,
			repeatSummary: DASH,
			updatedDisplay: formatDateShort(row.updatedAt)
		};
	}

	const nChannels = snap.selectedIntegrationIds.length;
	const channelsSummary = nChannels === 0 ? 'No channels' : `${nChannels} channel${nChannels === 1 ? '' : 's'}`;
	const channelsDisplayVm = nChannels === 0 ? null : buildSetGridChannelsDisplayViewModel(snap, channels);

	const nTags = snap.selectedTagNames.length;
	const tagsSummary = nTags === 0 ? DASH : snap.selectedTagNames.join(', ');
	const tagsDisplayVm =
		nTags === 0 ? [] : buildSetGridTagsDisplayViewModel(snap.selectedTagNames, workspaceTags);

	const nReplies = countThreadsAutoReplies(snap.providerSettingsByIntegrationId);
	const threadsSummary =
		nReplies === 0 ? DASH : `${nReplies} auto-repl${nReplies === 1 ? 'y' : 'ies'}`;

	const nMedia = snap.postMediaItems.length;
	const mediaSummary = nMedia === 0 ? DASH : `${nMedia} attachment${nMedia === 1 ? '' : 's'}`;

	return {
		id: row.id,
		setRowVm: row,
		name: row.name,
		channelsSummary,
		channelsDisplayVm,
		bodyPreview: bodyPreviewFromSnapshot(snap),
		bodyPreviewTooltip: bodyPreviewTooltipFromSnapshot(snap),
		tagsSummary: truncate(tagsSummary, 80),
		tagsDisplayVm,
		threadsSummary,
		mediaSummary,
		repeatSummary: repeatIntervalLabel(snap.repeatInterval),
		updatedDisplay: formatDateShort(row.updatedAt)
	};
}

export function sortSetGridRows(rows: SetGridTableRowViewModel[]): SetGridTableRowViewModel[] {
	return [...rows].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Column visibility and width hints for the sets (templates) SVAR grid — pairs with `PlugGridVis` in
 * `PlugGridTable.presenter.svelte.ts`.
 */
type SetsGridVis = {
	channels: boolean;
	bodyPreview: boolean;
	tags: boolean;
	threads: boolean;
	media: boolean;
	repeat: boolean;
	updated: boolean;
	/** Name + actions only; actions column has a visible header */
	compact: boolean;
	compactNameWidthPx?: number;
	bodyPreviewMinWidthPx?: number;
	bodyPreviewFlexGrow?: boolean;
	compactChannelsWidthPx?: number;
	compactActionsWidthPx?: number;
};

/**
 * Wide-desktop layout: all metadata columns + flexing body — analogue of `PLUG_GRID_WIDE_DEFAULTS` in `PlugGridTable.presenter.svelte.ts`.
 * `bodyPreviewMinWidthPx` is tuned per breakpoint and autosize.
 */
const SETS_GRID_WIDE_DEFAULTS: SetsGridVis = {
	channels: true,
	bodyPreview: true,
	bodyPreviewMinWidthPx: 176,
	tags: true,
	threads: true,
	media: true,
	repeat: true,
	updated: true,
	compact: false
};

type SetsGridApiWithColumn = IApi & {
	getColumn: (id: string) => { width?: number; hidden?: boolean } | undefined;
};

/**
 * Wired from {@link ProtectedTemplatesPagePresenter} like {@link SchedulerPresenter} on the calendar page.
 */
export class SetGridTablePresenter {
	setsGridRowsVm = $state<SetGridTableRowViewModel[]>([]);
	loading = $state(true);

	constructor(
		private readonly getSetPresenter: GetSetPresenter,
		private readonly dashboardPagePresenter: ProtectedDashboardPagePresenter
	) {}

	private _channelLookup(): SetGridChannelLookupViewModel[] {
		return this.dashboardPagePresenter.connectedChannelsVm.map((c) => ({
			id: c.id,
			internalId: c.internalId,
			name: c.name,
			identifier: c.identifier,
			picture: c.picture
		}));
	}

	/** Refresh grid rows for the current workspace (loads dashboard lists + tags; maps PM → grid VMs). */
	async refreshRowsForOrganization(organizationId: string): Promise<void> {
		if (!organizationId) {
			this.setsGridRowsVm = [];
			return;
		}
		await this.dashboardPagePresenter.loadDashboardLists();
		await this.dashboardPagePresenter.createSocialPostPresenter.loadWorkspaceTagsIfNeeded(organizationId);
		const rowsVm = await this.getSetPresenter.loadSetsListVm(organizationId);
		const channelLookup = this._channelLookup();
		const tagLookup = this.dashboardPagePresenter.createSocialPostPresenter.tagList;
		const rows = rowsVm.map((r) => toSetGridTableRowViewModel(r, channelLookup, tagLookup));
		this.setsGridRowsVm = sortSetGridRows(rows);
	}

	resetForNoWorkspace(): void {
		this.setsGridRowsVm = [];
		this.loading = false;
	}

	removeRowById(id: string): void {
		this.setsGridRowsVm = this.setsGridRowsVm.filter((r) => r.id !== id);
	}

	asTableRowVm(row: unknown): SetGridTableRowViewModel {
		return row as SetGridTableRowViewModel;
	}

	tagsTooltipPlainText(row: unknown): string {
		const vm = this.asTableRowVm(row);
		if (vm.tagsDisplayVm.length) return vm.tagsDisplayVm.map((t) => t.name).join(', ');
		return vm.tagsSummary;
	}

	setsGridCellStyle(_row: unknown, column: IColumn): string {
		if (column.id === 'bodyPreview') {
			return 'white-space:normal;word-break:break-word;overflow-wrap:anywhere;';
		}
		return '';
	}

	/** Fixed pixel width when compact; otherwise baseline width plus flexgrow so the column absorbs leftover horizontal space. */
	private _channelsColumnSizing(vis: SetsGridVis): Pick<IColumn, 'flexgrow' | 'width'> | Record<string, never> {
		if (!vis.channels) return {};
		if (vis.compact && vis.compactChannelsWidthPx != null) {
			return { width: vis.compactChannelsWidthPx };
		}
		return { flexgrow: 1, width: 96 };
	}

	/**
	 * Width / flexgrow for `bodyPreview` — analogue of {@link PlugGridTablePresenter['_messageDisplayColumnSizing']} (`messageDisplay`).
	 */
	private _bodyPreviewColumnSizing(vis: SetsGridVis): Pick<IColumn, 'flexgrow' | 'width'> {
		const width = vis.bodyPreviewMinWidthPx ?? 200;
		if (vis.bodyPreviewFlexGrow === false) {
			return { width };
		}
		return { flexgrow: 1, width };
	}

	/** Column defs for the sets (templates) SVAR grid — analogue of {@link PlugGridTablePresenter['_plugGridColumns']}. */
	private _setsGridColumns(vis: SetsGridVis): IColumn[] {
		const channelsForThreadsTooltip = this._channelLookup();
		return [
			{
				id: 'name',
				header: 'Name',
				tooltip: false,
				...(vis.compact && vis.compactNameWidthPx != null ? { width: vis.compactNameWidthPx } : {})
			},
			{
				id: 'channelsSummary',
				header: 'Channels',
				hidden: !vis.channels,
				...this._channelsColumnSizing(vis),
				cell: SetsGridChannelsCell,
				tooltip: (row: unknown) => buildSetsGridChannelsTooltipPlainText(this.asTableRowVm(row))
			},
			{
				id: 'bodyPreview',
				header: 'Body preview',
				hidden: !vis.bodyPreview,
				...(vis.bodyPreview
					? {
							...this._bodyPreviewColumnSizing(vis),
							tooltip: (row: unknown) => this.asTableRowVm(row).bodyPreviewTooltip
						}
					: { tooltip: false })
			},
			{
				id: 'tagsSummary',
				header: 'Tags',
				tooltip: (row: unknown) => this.tagsTooltipPlainText(row),
				hidden: !vis.tags,
				cell: SetsGridTagsCell
			},
			{
				id: 'threadsSummary',
				header: 'Auto-replies',
				tooltip: (row: unknown) =>
					buildSetsGridThreadsRepliesTooltipPlainText(this.asTableRowVm(row), channelsForThreadsTooltip),
				hidden: !vis.threads
			},
			{ id: 'mediaSummary', header: 'Media', tooltip: false, hidden: !vis.media },
			{ id: 'repeatSummary', header: 'Repeat', tooltip: false, hidden: !vis.repeat },
			{ id: 'updatedDisplay', header: 'Updated', tooltip: false, hidden: !vis.updated },
			{
				id: 'actions',
				header: 'Actions',
				width: vis.compactActionsWidthPx ?? 168,
				cell: SetsGridActionsCell,
				tooltip: false
			}
		] as IColumn[];
	}

	/** Shared column visibility for mid-width breakpoints (metadata hidden; body column uses a computed fixed width). */
	private _setsGridColumnsMidTier(bodyPreviewMinWidthPx: number, overrides: Partial<SetsGridVis> = {}): IColumn[] {
		return this._setsGridColumns({
			channels: true,
			bodyPreview: true,
			bodyPreviewMinWidthPx,
			bodyPreviewFlexGrow: false,
			tags: false,
			threads: false,
			media: false,
			repeat: false,
			updated: false,
			compact: false,
			...overrides
		});
	}

	getSetsGridColumnsForViewport(
		layoutTierWidthPx: number,
		compactLayoutWidthPx: number,
		browser: boolean
	): IColumn[] {
		const setsGridColumns = this._setsGridColumns(SETS_GRID_WIDE_DEFAULTS);

		if (!browser || layoutTierWidthPx <= 0) return setsGridColumns;
		if (layoutTierWidthPx <= 640) {
			const cw = compactLayoutWidthPx > 0 ? compactLayoutWidthPx : layoutTierWidthPx;
			const compactActionPx = 140;
			const compactChannelsPx = 76;
			const compactGutterPx = 20;
			const reserved = compactActionPx + compactChannelsPx + compactGutterPx;
			const nameW = Math.max(64, Math.min(132, Math.floor((cw - reserved) * 0.36)));
			const bodyColW = Math.max(72, cw - reserved - nameW);
			return this._setsGridColumns({
				channels: true,
				bodyPreview: true,
				bodyPreviewMinWidthPx: bodyColW,
				bodyPreviewFlexGrow: false,
				tags: false,
				threads: false,
				media: false,
				repeat: false,
				updated: false,
				compact: true,
				compactNameWidthPx: nameW,
				compactChannelsWidthPx: compactChannelsPx,
				compactActionsWidthPx: compactActionPx
			});
		}
		if (layoutTierWidthPx <= 1024) {
			const bodyMidW = Math.max(140, Math.min(240, Math.floor(layoutTierWidthPx - 420)));
			return this._setsGridColumnsMidTier(bodyMidW);
		}
		if (layoutTierWidthPx <= 1100) {
			const body1100W = Math.max(160, Math.min(220, Math.floor(layoutTierWidthPx - 480)));
			return this._setsGridColumnsMidTier(body1100W, { threads: true, updated: true });
		}
		return setsGridColumns;
	}

	getSetsGridSizesForViewport(layoutTierWidthPx: number, browser: boolean): {
		rowHeight: number;
		headerHeight: number;
	} {
		if (!browser || layoutTierWidthPx <= 0) return { rowHeight: 40, headerHeight: 38 };
		if (layoutTierWidthPx <= 640) return { rowHeight: 48, headerHeight: 42 };
		if (layoutTierWidthPx <= 1100) return { rowHeight: 44, headerHeight: 40 };
		return { rowHeight: 40, headerHeight: 38 };
	}

	private static readonly SETS_GRID_AUTOSIZE_COLUMN_IDS = [
		'name',
		'channelsSummary',
		'tagsSummary',
		'threadsSummary',
		'mediaSummary',
		'repeatSummary',
		'updatedDisplay'
	] as const;

	private static readonly SETS_GRID_COLUMN_MIN_WIDTH_PX: Partial<
		Record<(typeof SetGridTablePresenter.SETS_GRID_AUTOSIZE_COLUMN_IDS)[number], number>
	> = {
		name: 168,
		channelsSummary: 96,
		tagsSummary: 120,
		threadsSummary: 118,
		mediaSummary: 88,
		repeatSummary: 88,
		updatedDisplay: 108
	};

	private static readonly SETS_GRID_CHANNELS_MAX_WIDTH_PX = 168;

	private static readColumnWidthPx(api: IApi, id: string): number {
		const col = (api as SetsGridApiWithColumn).getColumn(id);
		return typeof col?.width === 'number' ? col.width : 0;
	}

	private static isSetsGridColumnHidden(api: IApi, id: string): boolean {
		return Boolean((api as SetsGridApiWithColumn).getColumn(id)?.hidden);
	}

	async autosizeSetsGridColumns(api: IApi, layoutTierWidthPx: number): Promise<void> {
		await tick();
		if (layoutTierWidthPx > 0 && layoutTierWidthPx <= 640) {
			return;
		}

		const narrowNameFlexLayout = SetGridTablePresenter.isSetsGridColumnHidden(api, 'channelsSummary');
		const ids = SetGridTablePresenter.SETS_GRID_AUTOSIZE_COLUMN_IDS.filter((id) => {
			if (SetGridTablePresenter.isSetsGridColumnHidden(api, id)) return false;
			if (id === 'name' && narrowNameFlexLayout) return false;
			return true;
		});

		const dataW: Record<string, number> = {};

		for (const id of ids) {
			api.exec('resize-column', { id, auto: 'data', maxRows: 200 });
		}
		await tick();
		for (const id of ids) {
			dataW[id] = SetGridTablePresenter.readColumnWidthPx(api, id);
		}

		for (const id of ids) {
			api.exec('resize-column', { id, auto: 'header' });
		}
		await tick();
		for (const id of ids) {
			const w = Math.max(dataW[id] ?? 0, SetGridTablePresenter.readColumnWidthPx(api, id));
			if (w > 0) api.exec('resize-column', { id, width: w });
		}

		await tick();
		for (const id of ids) {
			const min = SetGridTablePresenter.SETS_GRID_COLUMN_MIN_WIDTH_PX[id];
			if (min == null) continue;
			const w = SetGridTablePresenter.readColumnWidthPx(api, id);
			if (w < min) api.exec('resize-column', { id, width: min });
		}

		await tick();
		if (!SetGridTablePresenter.isSetsGridColumnHidden(api, 'channelsSummary')) {
			const wch = SetGridTablePresenter.readColumnWidthPx(api, 'channelsSummary');
			if (wch > SetGridTablePresenter.SETS_GRID_CHANNELS_MAX_WIDTH_PX) {
				api.exec('resize-column', {
					id: 'channelsSummary',
					width: SetGridTablePresenter.SETS_GRID_CHANNELS_MAX_WIDTH_PX
				});
			}
		}
	}
}
