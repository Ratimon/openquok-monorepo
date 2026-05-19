import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';
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
	PostKanbanSourceFilter,
	PostKanbanTimeFilter
} from '$lib/posts/postKanbanBoard.types';
import {
	formatKanbanPublishScheduleLabel,
	formatKanbanRelativePublishLabel,
	kanbanColumnStatusLabel,
	stateToKanbanColumn
} from '$lib/posts/utils/postKanbanBoardFormat';
import { matchesKanbanTimeFilter } from '$lib/posts/utils/postKanbanBoardTimeFilter';
import { stripHtmlToPlainText, truncatePlainText } from '$lib/utils/plainTextFromHtml';
import dayjs from 'dayjs';

const CONTENT_PREVIEW_MAX_CHARS = 160;

export function filterKanbanCardsBySource(
	cardsVm: readonly PostKanbanCardViewModel[],
	sourceFilter: PostKanbanSourceFilter
): PostKanbanCardViewModel[] {
	if (sourceFilter === 'all') return [...cardsVm];
	return cardsVm.filter((card) =>
		sourceFilter === 'agent' ? card.isAgentEdited : !card.isAgentEdited
	);
}

export function filterKanbanCardsByTime(
	cardsVm: readonly PostKanbanCardViewModel[],
	timeFilter: PostKanbanTimeFilter
): PostKanbanCardViewModel[] {
	return cardsVm.filter((card) => matchesKanbanTimeFilter(card.publishDateIso, timeFilter));
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

/** Drafts stay visible regardless of publish-date window; scheduled/published respect the time filter. */
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
		const column = stateToKanbanColumn(rep.state);
		if (!column) continue;

		const content =
			groupRows.find((r) => r.content?.trim())?.content?.trim() ?? rep.content?.trim() ?? '';
		const integrationIds = [
			...new Set(
				groupRows.map((r) => r.integrationId).filter((id): id is string => Boolean(id))
			)
		];
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
			statusLabel: kanbanColumnStatusLabel(column),
			publishDateIso: rep.publishDate,
			note: rep.note ?? null,
			channelSlots,
			hiddenChannelCount: Math.max(0, channelSlots.length - previewCount),
			primaryChannelName: channelSlots[0]?.name ?? '',
			isAgentOrigin: rep.createdByUserId == null,
			isAgentEdited: rep.isAgentEdited ?? false,
			isReviewed: rep.isReviewed ?? false
		});
	}
	return cards;
}
