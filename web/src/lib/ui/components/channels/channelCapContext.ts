export const channelCapKey = Symbol('channelCap');

export type ChannelCapLimitKind = 'active' | 'connected';

/** Workspace channel caps; set by {@link ChannelCapProvider}. */
export type ChannelCapContext = {
	getConnectedChannelCount: () => number;
	getActiveChannelCount: () => number;
	getChannelLimit: () => number | null;
	isConnectedChannelLimitFull: () => boolean;
	isActiveChannelLimitFull: () => boolean;
	canEnableChannel: () => boolean;
	openConnectedLimitUpgradeDialog: () => void;
	openActiveLimitUpgradeDialog: () => void;
};

export const ACTIVE_CHANNEL_LIMIT_TOOLTIP =
	'Active channel limit reached — disable another channel or upgrade.';

export function resolveChannelLimit(allowed: number | null | undefined): number | null {
	return allowed != null && allowed >= 1 ? allowed : null;
}

export function countActiveChannels(channels: ReadonlyArray<{ disabled?: boolean }>): number {
	return channels.filter((c) => !c.disabled).length;
}

export function parseChannelCapLimitKind(message: string): ChannelCapLimitKind | undefined {
	const normalized = message.toLowerCase();
	if (normalized.includes('active channel')) return 'active';
	if (normalized.includes('connected channel')) return 'connected';
	return undefined;
}

export function openChannelLimitDialogForMutation(
	limitKind: ChannelCapLimitKind | undefined,
	ctx: ChannelCapContext | undefined
): void {
	if (!ctx || !limitKind) return;
	if (limitKind === 'active') {
		ctx.openActiveLimitUpgradeDialog();
		return;
	}
	ctx.openConnectedLimitUpgradeDialog();
}
