import type {
	PostKanbanCardViewModel,
	PostKanbanColumnId
} from '$lib/posts/postKanbanBoard.types';

import dayjs from 'dayjs';

import {
	formatKanbanPublishScheduleLabel,
	formatKanbanRelativePublishLabel,
	kanbanColumnStatusLabel
} from '$lib/posts/utils/scheduler';

type LandingKanbanMockCardInput = Omit<
	PostKanbanCardViewModel,
	'publishDateIso' | 'publishLabel' | 'publishTimeLabel' | 'relativePublishLabel' | 'statusLabel'
>;

/** Relative publish time so landing kanban filters never hide sample cards. */
export function landingKanbanMockSchedule(
	column: PostKanbanColumnId,
	offsetDays: number,
	time: { hour: number; minute?: number } = { hour: 9 }
) {
	const iso = dayjs()
		.add(offsetDays, 'day')
		.hour(time.hour)
		.minute(time.minute ?? 0)
		.second(0)
		.millisecond(0)
		.toISOString();

	return {
		publishDateIso: iso,
		publishLabel: dayjs(iso).format('MMM D, YYYY h:mm A'),
		publishTimeLabel: formatKanbanPublishScheduleLabel(iso),
		relativePublishLabel: formatKanbanRelativePublishLabel(iso),
		statusLabel: kanbanColumnStatusLabel(column)
	};
}

export function applyLandingKanbanMockSchedule(
	card: LandingKanbanMockCardInput,
	offsetDays: number,
	time: { hour: number; minute?: number } = { hour: 9 }
): PostKanbanCardViewModel {
	return {
		...card,
		...landingKanbanMockSchedule(card.column, offsetDays, time)
	};
}
