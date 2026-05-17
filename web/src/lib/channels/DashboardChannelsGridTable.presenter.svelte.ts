import type { IColumn } from '@svar-ui/svelte-grid';

import type { CreateSocialPostChannelViewModel } from '$lib/channels/GetChannel.presenter.svelte';
import { socialProviderDisplayLabel } from '$data/social-providers';

import DashboardChannelsGridAccountCell from '$lib/ui/components/dashboard-channels/DashboardChannelsGridAccountCell.svelte';
import DashboardChannelsGridActionsCell from '$lib/ui/components/dashboard-channels/DashboardChannelsGridActionsCell.svelte';
import DashboardChannelsGridAddMoreCell from '$lib/ui/components/dashboard-channels/DashboardChannelsGridAddMoreCell.svelte';
import DashboardChannelsGridStatusCell from '$lib/ui/components/dashboard-channels/DashboardChannelsGridStatusCell.svelte';

/** Display label when a channel has no workspace group (table + filters). */
export const DASHBOARD_CHANNEL_UNGROUPED_GROUP_LABEL = 'ungrouped';

/** One row in the account dashboard connected-channels SVAR grid. */
export type DashboardChannelTableRowViewModel = {
	id: string;
	channel: CreateSocialPostChannelViewModel;
	platformLabel: string;
	platformKey: string;
	channelName: string;
	channelPicture: string | null;
	groupName: string;
	groupId: string | null;
	statusDisplay: string;
};

type DashboardChannelsGridVis = {
	accountWidth: number;
	platformWidth: number;
	groupWidth: number;
	statusWidth: number;
	actionsWidthPx: number;
	addMoreWidthPx: number;
	compact: boolean;
	accountHeader: string;
};

const DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS: DashboardChannelsGridVis = {
	accountWidth: 240,
	platformWidth: 140,
	groupWidth: 160,
	statusWidth: 120,
	actionsWidthPx: 96,
	addMoreWidthPx: 148,
	compact: false,
	accountHeader: 'Connected account'
};

function statusLabelForChannel(ch: CreateSocialPostChannelViewModel): string {
	if (ch.disabled) return 'Disabled';
	if (ch.inBetweenSteps) return 'Setup incomplete';
	if (ch.refreshNeeded) return 'Refresh needed';
	if (!ch.schedulable) return ch.unschedulableReason?.trim() || 'Unavailable';
	return 'Ready';
}

function toDashboardChannelTableRowViewModel(
	ch: CreateSocialPostChannelViewModel
): DashboardChannelTableRowViewModel {
	const platformKey = String(ch.identifier ?? '').trim();
	return {
		id: ch.id,
		channel: ch,
		platformLabel: socialProviderDisplayLabel(platformKey),
		platformKey,
		channelName: ch.name?.trim() || platformKey || 'Channel',
		channelPicture: ch.picture,
		groupName: ch.group?.name?.trim() || DASHBOARD_CHANNEL_UNGROUPED_GROUP_LABEL,
		groupId: ch.group?.id ?? null,
		statusDisplay: statusLabelForChannel(ch)
	};
}

/**
 * SVAR grid table for account dashboard connected channels (table layout mode).
 *
 * Source channel list is owned by the page presenter (`connectedChannelsVm`). This presenter only owns grid row VMs.
 */
export class DashboardChannelsGridTablePresenter {
	/** Grid rows — analogue of {@link PlugGridTablePresenter.plugRulesRowsVm}. */
	dashboardChannelTableRowsVm = $state<DashboardChannelTableRowViewModel[]>([]);

	refreshRowsFromChannels(channels: readonly CreateSocialPostChannelViewModel[]): void {
		const rows = channels.map(toDashboardChannelTableRowViewModel);
		rows.sort((a, b) => {
			const byPlatform = a.platformLabel.localeCompare(b.platformLabel, undefined, { sensitivity: 'base' });
			if (byPlatform !== 0) return byPlatform;
			const byGroup = a.groupName.localeCompare(b.groupName, undefined, { sensitivity: 'base' });
			if (byGroup !== 0) return byGroup;
			return a.channelName.localeCompare(b.channelName, undefined, { sensitivity: 'base' });
		});
		this.dashboardChannelTableRowsVm = rows;
	}

	resetForNoWorkspace(): void {
		this.dashboardChannelTableRowsVm = [];
	}

	accountTooltipPlainText(row: unknown): string {
		const r = row as DashboardChannelTableRowViewModel;
		const parts = [r.channelName?.trim(), r.platformLabel?.trim(), r.groupName?.trim()].filter(Boolean);
		return parts.join('\n');
	}

	private _dashboardChannelsGridColumns(vis: DashboardChannelsGridVis): IColumn[] {
		return [
			{
				id: 'channelAccount',
				header: vis.accountHeader,
				width: vis.accountWidth,
				cell: DashboardChannelsGridAccountCell,
				tooltip: (row: unknown) => this.accountTooltipPlainText(row)
			},
			{
				id: 'platformLabel',
				header: 'Platform',
				width: vis.platformWidth,
				tooltip: false
			},
			{
				id: 'groupName',
				header: 'Group',
				width: vis.groupWidth,
				tooltip: false
			},
			{
				id: 'statusDisplay',
				header: 'Status',
				width: vis.statusWidth,
				cell: DashboardChannelsGridStatusCell,
				tooltip: false
			},
			{
				id: 'actions',
				header: 'Actions',
				width: vis.actionsWidthPx,
				cell: DashboardChannelsGridActionsCell,
				tooltip: false
			},
			{
				id: 'addMore',
				header: 'Add Channels',
				width: vis.addMoreWidthPx,
				cell: DashboardChannelsGridAddMoreCell,
				tooltip: false
			}
		] as unknown as IColumn[];
	}

	getDashboardChannelsGridColumnsForViewport(
		layoutTierWidthPx: number,
		gridLayoutWidthPx: number,
		browser: boolean
	): IColumn[] {
		const columns = this._dashboardChannelsGridColumns(DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS);

		const w = layoutTierWidthPx;
		if (!browser || w <= 0) return columns;

		if (w <= 640) {
			const cw = w;
			const actionsPx = 88;
			const addMorePx = 120;
			const statusPx = 80;
			const platformPx = Math.max(68, Math.min(88, Math.floor(cw * 0.18)));
			const groupPx = Math.max(68, Math.min(92, Math.floor(cw * 0.2)));
			const gutter = 16;
			const accountPx = Math.max(
				72,
				cw - platformPx - groupPx - statusPx - actionsPx - addMorePx - gutter
			);
			return this._dashboardChannelsGridColumns({
				accountWidth: accountPx,
				platformWidth: platformPx,
				groupWidth: groupPx,
				statusWidth: statusPx,
				actionsWidthPx: actionsPx,
				addMoreWidthPx: addMorePx,
				compact: true,
				accountHeader: 'Account'
			});
		}

		const basis = gridLayoutWidthPx > 0 ? gridLayoutWidthPx : w;

		if (w <= 1024) {
			const accountPx = Math.max(168, Math.min(200, Math.floor(w * 0.24)));
			const platformPx = Math.max(96, Math.min(120, Math.floor(w * 0.12)));
			const groupPx = Math.max(96, Math.min(128, Math.floor(w * 0.14)));
			const statusPx = 100;
			const actionsPx = 96;
			const addMorePx = 136;
			return this._dashboardChannelsGridColumns({
				accountWidth: accountPx,
				platformWidth: platformPx,
				groupWidth: groupPx,
				statusWidth: statusPx,
				actionsWidthPx: actionsPx,
				addMoreWidthPx: addMorePx,
				compact: false,
				accountHeader: 'Connected account'
			});
		}

		const gutter = 28;
		const reserved =
			DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS.accountWidth +
			DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS.platformWidth +
			DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS.groupWidth +
			DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS.statusWidth +
			DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS.actionsWidthPx +
			DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS.addMoreWidthPx +
			gutter;
		const accountW = Math.max(200, Math.floor(basis - reserved + DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS.accountWidth));
		return this._dashboardChannelsGridColumns({
			...DASHBOARD_CHANNELS_GRID_WIDE_DEFAULTS,
			accountWidth: accountW
		});
	}

	getDashboardChannelsGridSizesForViewport(
		layoutTierWidthPx: number,
		browser: boolean
	): { rowHeight: number; headerHeight: number } {
		if (!browser || layoutTierWidthPx <= 0) return { rowHeight: 44, headerHeight: 40 };
		if (layoutTierWidthPx <= 640) return { rowHeight: 48, headerHeight: 42 };
		return { rowHeight: 44, headerHeight: 40 };
	}

	getDashboardChannelsGridAutoRowHeight(layoutTierWidthPx: number, browser: boolean): boolean {
		return Boolean(browser && layoutTierWidthPx > 0);
	}

	dashboardChannelsGridCellStyle(_row: unknown, column: IColumn): string {
		if (String(column.id ?? '') === 'groupName') {
			return 'white-space:normal;word-break:break-word;overflow-wrap:anywhere;';
		}
		return '';
	}
}
