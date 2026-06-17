import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';
import type { ChannelViewModel } from '$lib/posts/scheduler.types';
import { deriveIntegrationFilter } from '$lib/posts/utils/schedulerIntegrationFilter';
import { isProfileChannelDisplayName } from '$data/social-providers';
import {
	channelDisplayFromPostRow,
	resolvePostChannelDisplay
} from '$lib/posts/GetScheduledPost.presenter.svelte';
import type {
	PostKanbanCardViewModel,
	PostKanbanChannelSlotViewModel,
	PostKanbanColumnId,
	PostKanbanColumnsViewModel,
	PostKanbanRowViewModel,
	PostKanbanReviewFilter,
	PostKanbanSourceFilter,
	PostKanbanTimeFilter
} from '$lib/posts/postKanbanBoard.types';
import {
	formatKanbanPublishScheduleLabel,
	formatKanbanRelativePublishLabel,
	kanbanColumnStatusLabel,
	stateToKanbanColumn
} from '$lib/posts/utils/postKanbanBoardFormat';
import { resolveTiktokManualFinish } from '$lib/posts/utils/tiktokKanbanManualFinish';
import { matchesTagFilters } from '$lib/posts/utils/postTagFilter';
import { matchesKanbanTimeFilter } from '$lib/posts/utils/postKanbanBoardTimeFilter';
import { stripHtmlToPlainText, truncatePlainText } from '$lib/utils/plainTextFromHtml';
import dayjs from 'dayjs';

const CONTENT_PREVIEW_MAX_CHARS = 160;

export function filterKanbanCardsByIntegration(
	cardsVm: readonly PostKanbanCardViewModel[],
	channels: readonly ChannelViewModel[],
	allGroups: boolean,
	selectedGroupIds: string[],
	allSocialPlatforms: boolean,
	selectedSocialPlatformIdentifiers: string[]
): PostKanbanCardViewModel[] {
	const integrationFilter = deriveIntegrationFilter(
		[...channels],
		allGroups,
		selectedGroupIds,
		allSocialPlatforms,
		selectedSocialPlatformIdentifiers
	);
	if (integrationFilter.kind === 'all') return [...cardsVm];
	if (integrationFilter.kind === 'none') return [];
	const allowed = new Set(integrationFilter.integrationIds);
	return cardsVm.filter((card) =>
		card.channelSlots.some((slot) => allowed.has(slot.integrationId))
	);
}

export function filterKanbanCardsByTags(
	cardsVm: readonly PostKanbanCardViewModel[],
	allTags: boolean,
	selectedTagNames: string[]
): PostKanbanCardViewModel[] {
	if (allTags) return [...cardsVm];
	const selected = new Set(
		selectedTagNames.map((n) => String(n ?? '').trim().toLowerCase()).filter(Boolean)
	);
	if (selected.size === 0) return [...cardsVm];
	return cardsVm.filter((card) => matchesTagFilters(card.tagNames, selected));
}

export function filterKanbanCardsBySource(
	cardsVm: readonly PostKanbanCardViewModel[],
	sourceFilter: PostKanbanSourceFilter
): PostKanbanCardViewModel[] {
	if (sourceFilter === 'all') return [...cardsVm];
	return cardsVm.filter((card) =>
		sourceFilter === 'agent' ? card.isAgentEdited : !card.isAgentEdited
	);
}

export function filterKanbanCardsByReview(
	cardsVm: readonly PostKanbanCardViewModel[],
	reviewFilter: PostKanbanReviewFilter
): PostKanbanCardViewModel[] {
	if (reviewFilter === 'all') return [...cardsVm];
	if (reviewFilter === 'todo') return cardsVm.filter((card) => !card.isReviewed);
	return cardsVm.filter((card) => card.isReviewed);
}

export function filterKanbanCardsByTime(
	cardsVm: readonly PostKanbanCardViewModel[],
	timeFilter: PostKanbanTimeFilter
): PostKanbanCardViewModel[] {
	return cardsVm.filter(
		(card) =>
			card.needsManualFinishInApp || matchesKanbanTimeFilter(card.publishDateIso, timeFilter)
	);
}

export function groupKanbanCardsIntoColumns(
	cardsVm: readonly PostKanbanCardViewModel[]
): PostKanbanColumnsViewModel {
	const columns: PostKanbanColumnsViewModel = { draft: [], scheduled: [], published: [] };
	for (const card of cardsVm) {
		columns[card.column].push(card);
	}
	for (const col of Object.keys(columns) as PostKanbanColumnId[]) {
		columns[col].sort((a, b) => a.publishLabel.localeCompare(b.publishLabel));
	}
	return columns;
}

export function buildKanbanColumnCounts(
	visibleColumns: PostKanbanColumnsViewModel,
	totalColumns: PostKanbanColumnsViewModel
) {
	return {
		draft: { visible: visibleColumns.draft.length, total: totalColumns.draft.length },
		scheduled: {
			visible: visibleColumns.scheduled.length,
			total: totalColumns.scheduled.length
		},
		published: {
			visible: visibleColumns.published.length,
			total: totalColumns.published.length
		}
	};
}

/** Drafts always show; scheduled and published respect the active time filter. */
export function buildKanbanColumnsWithTimeFilter(
	cardsVm: readonly PostKanbanCardViewModel[],
	timeFilter: PostKanbanTimeFilter
): PostKanbanColumnsViewModel {
	const allColumns = groupKanbanCardsIntoColumns(cardsVm);
	const timeFiltered = groupKanbanCardsIntoColumns(filterKanbanCardsByTime(cardsVm, timeFilter));
	return {
		draft: allColumns.draft,
		scheduled: timeFiltered.scheduled,
		published: timeFiltered.published
	};
}

function channelSlotFromDisplay(display: {
	integrationId: string;
	picture: string | null;
	name: string;
	identifier: string;
}): PostKanbanChannelSlotViewModel {
	return {
		integrationId: display.integrationId,
		picture: display.picture,
		name: display.name,
		identifier: display.identifier
	};
}

export function channelSlotFromChannel(
	integrationId: string,
	ch: CreateSocialPostChannelViewModel
): PostKanbanChannelSlotViewModel {
	return channelSlotFromDisplay({
		integrationId,
		picture: ch.picture,
		name: ch.name,
		identifier: ch.identifier
	});
}

function resolveChannelSlot(
	integrationId: string,
	groupRows: PostKanbanRowViewModel[],
	channelById: Map<string, CreateSocialPostChannelViewModel>,
	channelSnapshotById: Map<string, PostKanbanChannelSlotViewModel>
): PostKanbanChannelSlotViewModel {
	const row = groupRows.find((r) => r.integrationId === integrationId);
	const resolved = resolvePostChannelDisplay(integrationId, row, channelById);
	const fromApi = channelDisplayFromPostRow(integrationId, row);
	if (fromApi?.name || fromApi?.picture) return channelSlotFromDisplay(fromApi);

	const snapshot = channelSnapshotById.get(integrationId);
	if (
		snapshot &&
		(snapshot.picture || isProfileChannelDisplayName(snapshot.name, snapshot.identifier))
	) {
		return snapshot;
	}

	const ch = channelById.get(integrationId);
	if (ch) return channelSlotFromChannel(integrationId, ch);
	if (fromApi) return channelSlotFromDisplay(fromApi);
	if (snapshot) return snapshot;

	return channelSlotFromDisplay(resolved);
}

const KANBAN_COLUMN_PRIORITY: Record<PostKanbanColumnId, number> = {
	draft: 0,
	scheduled: 1,
	published: 2
};

function resolveKanbanCardPlacement(groupRows: PostKanbanRowViewModel[]): {
	column: PostKanbanColumnId;
	manualFinish: ReturnType<typeof resolveTiktokManualFinish>;
} | null {
	const placements = groupRows
		.map((row) => {
			const manualFinish = resolveTiktokManualFinish(row);
			const column = stateToKanbanColumn(row.state, manualFinish);
			return column ? { column, manualFinish } : null;
		})
		.filter((p): p is NonNullable<typeof p> => p !== null);

	if (!placements.length) return null;

	const manualFinish =
		placements.find((p) => p.manualFinish)?.manualFinish ?? null;
	const column = placements.reduce(
		(best, p) =>
			KANBAN_COLUMN_PRIORITY[p.column] < KANBAN_COLUMN_PRIORITY[best] ? p.column : best,
		placements[0]!.column
	);

	return { column, manualFinish };
}

export function buildKanbanCardsVm(
	listVm: PostKanbanRowViewModel[],
	channelById: Map<string, CreateSocialPostChannelViewModel>,
	channelSnapshotById: Map<string, PostKanbanChannelSlotViewModel>
): PostKanbanCardViewModel[] {
	const byGroup = new Map<string, PostKanbanRowViewModel[]>();
	for (const row of listVm) {
		const list = byGroup.get(row.postGroup) ?? [];
		list.push(row);
		byGroup.set(row.postGroup, list);
	}

	const cards: PostKanbanCardViewModel[] = [];
	for (const [postGroup, groupRows] of byGroup) {
		const rep = groupRows[0]!;
		const placement = resolveKanbanCardPlacement(groupRows);
		if (!placement) continue;

		const { column, manualFinish } = placement;

		const content =
			groupRows.find((r) => r.content?.trim())?.content?.trim() ?? rep.content?.trim() ?? '';
		const integrationIds = [
			...new Set(
				groupRows.map((r) => r.integrationId).filter((id): id is string => Boolean(id))
			)
		];
		const tagNames = [
			...new Set(groupRows.flatMap((r) => r.tagNames ?? []).map((n) => String(n).trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const channelSlots = integrationIds.map((integrationId) =>
			resolveChannelSlot(integrationId, groupRows, channelById, channelSnapshotById)
		);
		const previewCount = Math.min(channelSlots.length, 3);

		cards.push({
			postId: rep.id,
			postGroup,
			column,
			contentPreview: truncatePlainText(
				stripHtmlToPlainText(content),
				CONTENT_PREVIEW_MAX_CHARS
			),
			publishLabel: dayjs(rep.publishDate).format('MMM D, YYYY h:mm A'),
			publishTimeLabel: formatKanbanPublishScheduleLabel(rep.publishDate),
			relativePublishLabel: formatKanbanRelativePublishLabel(rep.publishDate),
			statusLabel: kanbanColumnStatusLabel(column, manualFinish),
			publishDateIso: rep.publishDate,
			note: rep.note ?? null,
			channelSlots,
			hiddenChannelCount: Math.max(0, channelSlots.length - previewCount),
			primaryChannelName: channelSlots[0]?.name ?? '',
			isAgentEdited: rep.isAgentEdited ?? false,
			isReviewed: rep.isReviewed ?? false,
			tagNames,
			needsManualFinishInApp: Boolean(manualFinish),
			suggestedReviewNote:
				manualFinish && !rep.note?.trim() ? manualFinish.defaultReviewNote : null
		});
	}
	return cards;
}
