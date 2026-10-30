import {
	isSocialComposerChannel,
	type SocialIntegrationChannel,
} from './openquokSocialApi.js';

export type SocialChannelGroup = { id: string; name: string };

export function listChannelGroups(channels: SocialIntegrationChannel[]): SocialChannelGroup[] {
	const map = new Map<string, SocialChannelGroup>();
	for (const channel of channels) {
		const group = channel.group;
		if (group?.id) map.set(group.id, { id: group.id, name: group.name });
	}
	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function schedulableComposerChannelIds(channels: SocialIntegrationChannel[]): string[] {
	return channels.filter(isSocialComposerChannel).map((c) => c.id);
}

export function integrationIdsForGroup(
	channels: SocialIntegrationChannel[],
	groupId: string
): string[] {
	return channels.filter((c) => c.group?.id === groupId).map((c) => c.id);
}

export function isAllSchedulableSelected(
	channels: SocialIntegrationChannel[],
	selectedIds: Set<string>
): boolean {
	const schedulable = schedulableComposerChannelIds(channels);
	return schedulable.length > 0 && schedulable.every((id) => selectedIds.has(id));
}

export function selectionMatchesGroup(
	channels: SocialIntegrationChannel[],
	selectedIds: Set<string>,
	groupId: string | null
): boolean {
	if (!groupId) return false;
	const groupIds = integrationIdsForGroup(channels, groupId);
	if (groupIds.length === 0) return false;
	if (selectedIds.size !== groupIds.length) return false;
	return groupIds.every((id) => selectedIds.has(id));
}
