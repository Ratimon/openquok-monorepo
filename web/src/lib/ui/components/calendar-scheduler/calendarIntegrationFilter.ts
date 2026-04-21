import { CALENDAR_UNGROUPED_SENTINEL } from './types';
import type { ChannelVm } from './types';

export type CalendarIntegrationFilter =
	| { kind: 'all' }
	| { kind: 'integrations'; integrationIds: string[] }
	| { kind: 'none' };

export function deriveCalendarIntegrationFilter(
	channels: ChannelVm[],
	allGroups: boolean,
	selectedGroupIds: string[]
): CalendarIntegrationFilter {
	if (allGroups) return { kind: 'all' };
	const selected = new Set(selectedGroupIds);
	const integrationIds: string[] = [];
	for (const c of channels) {
		const gid = c.group?.id;
		if (gid && selected.has(gid)) integrationIds.push(c.id);
		if (!gid && selected.has(CALENDAR_UNGROUPED_SENTINEL)) integrationIds.push(c.id);
	}
	if (integrationIds.length === 0) return { kind: 'none' };
	return { kind: 'integrations', integrationIds };
}
