import type { IColumn } from '@svar-ui/svelte-grid';

import type {
	IntegrationPlugRowProgrammerModel,
	PlugRepository
} from '$lib/plugs/Plug.repository.svelte';
import type {
	ConnectedIntegrationChannelViewModel,
	GetPlugPresenter,
	PlugCatalogProviderViewModel,
	PlugRuleTableRowViewModel
} from '$lib/plugs/GetPlug.presenter.svelte';

import PlugsGridAccountCell from '$lib/ui/components/plugs/PlugsGridAccountCell.svelte';
import PlugsGridActiveCell from '$lib/ui/components/plugs/PlugsGridActiveCell.svelte';
import PlugsGridActionsCell from '$lib/ui/components/plugs/PlugsGridActionsCell.svelte';


/**
 * Column visibility / width hints for the plugs SVAR grid at a breakpoint — pairs with `SetsGridVis` in
 * `SetGridTable.presenter.svelte.ts`.
 */
type PlugGridVis = {
	likes: boolean;
	accountWidth: number;
	likesWidthPx: number;
	messageFlexGrow: boolean;
	messageWidthPx: number;
	actionsWidthPx: number;
	activeWidthPx: number;
	compact: boolean;
	accountHeader: string;
};

/**
 * Wide-desktop chrome (fixed column widths); {@link PlugGridVis.messageWidthPx} is refined per layout basis.
 * Analogue of `SETS_GRID_WIDE_DEFAULTS` in `SetGridTable.presenter.svelte.ts`.
 */
const PLUG_GRID_WIDE_DEFAULTS: PlugGridVis = {
	likes: true,
	accountWidth: 220,
	likesWidthPx: 118,
	messageFlexGrow: false,
	messageWidthPx: 320,
	actionsWidthPx: 152,
	activeWidthPx: 88,
	compact: false,
	accountHeader: 'Connected account'
};

/**
 * Wired from {@link ProtectedPlugsPagePresenter} like {@link SetGridTablePresenter} on templates.
 */
export class PlugGridTablePresenter {
	plugRulesRowsVm = $state<PlugRuleTableRowViewModel[]>([]);

	constructor(
		private readonly getPlugPresenter: GetPlugPresenter,
		private readonly plugRepository: PlugRepository
	) {}

	resetForNoWorkspace(): void {
		this.plugRulesRowsVm = [];
	}

	toGridRowVm(
		plugCatalogVm: PlugCatalogProviderViewModel[],
		channel: ConnectedIntegrationChannelViewModel,
		rowPm: IntegrationPlugRowProgrammerModel
	): PlugRuleTableRowViewModel {
		const catalogForProvider = plugCatalogVm.find(
			(p) => p.identifier === (channel.identifier ?? '').toLowerCase()
		);
		return this.getPlugPresenter.toPlugRuleTableRowViewModel({
			channel,
			catalogForProvider,
			rowPm
		});
	}

	private _sortPlugRuleRows(rows: PlugRuleTableRowViewModel[]): PlugRuleTableRowViewModel[] {
		return [...rows].sort((a, b) => {
			const byChannel = a.channelName.localeCompare(b.channelName);
			if (byChannel !== 0) return byChannel;
			return a.ruleTitle.localeCompare(b.ruleTitle);
		});
	}

	async refreshRowsForOrganization(
		organizationId: string,
		plugCatalogVm: PlugCatalogProviderViewModel[],
		channelsVm: ConnectedIntegrationChannelViewModel[]
	): Promise<void> {
		if (!organizationId) {
			this.resetForNoWorkspace();
			return;
		}
		const catalog = plugCatalogVm;
		const supported = channelsVm.filter((c) =>
			catalog.some((p) => p.identifier === (c.identifier ?? '').toLowerCase())
		);
		const rows: PlugRuleTableRowViewModel[] = [];
		for (const ch of supported) {
			const catalogForProvider = catalog.find(
				(p) => p.identifier === (ch.identifier ?? '').toLowerCase()
			);
			const plugRows = await this.plugRepository.listIntegrationPlugs(organizationId, ch.id);
			for (const rowPm of plugRows) {
				rows.push(
					this.getPlugPresenter.toPlugRuleTableRowViewModel({
						channel: ch,
						catalogForProvider,
						rowPm
					})
				);
			}
		}
		this.plugRulesRowsVm = this._sortPlugRuleRows(rows);
	}

	upsertRuleAfterCatalogSave(rowVm: PlugRuleTableRowViewModel, previousPlugId?: string): void {
		if (previousPlugId) {
			this.plugRulesRowsVm = this._sortPlugRuleRows(
				this.plugRulesRowsVm.map((r) => (r.plugRowPm.id === previousPlugId ? rowVm : r))
			);
		} else {
			this.plugRulesRowsVm = this._sortPlugRuleRows([...this.plugRulesRowsVm, rowVm]);
		}
	}

	replaceRuleAfterSingleEditorSave(plugId: string, rowVm: PlugRuleTableRowViewModel): void {
		this.plugRulesRowsVm = this._sortPlugRuleRows(
			this.plugRulesRowsVm.map((r) => (r.plugRowPm.id === plugId ? rowVm : r))
		);
	}

	removeRuleRowByPlugId(plugId: string): void {
		this.plugRulesRowsVm = this.plugRulesRowsVm.filter((r) => r.plugRowPm.id !== plugId);
	}

	patchRuleActivated(plugId: string, activated: boolean): void {
		this.plugRulesRowsVm = this.plugRulesRowsVm.map((r) =>
			r.plugRowPm.id !== plugId
				? r
				: {
						...r,
						activated,
						plugRowPm: { ...r.plugRowPm, activated }
					}
		);
	}

	accountTooltipPlainText(row: unknown): string {
		const r = row as PlugRuleTableRowViewModel;
		const parts = [r.channelName?.trim(), r.platformLabel?.trim()].filter(Boolean);
		return parts.join('\n');
	}

	/**
	 * Width / flexgrow for the `messageDisplay` column — mirrors {@link SetGridTablePresenter['_bodyPreviewColumnSizing']}
	 * on the templates grid (`bodyPreview`).
	 */
	private _messageDisplayColumnSizing(vis: PlugGridVis): Pick<IColumn, 'flexgrow' | 'width'> {
		if (vis.messageFlexGrow) {
			return { flexgrow: 1, width: vis.messageWidthPx };
		}
		return { width: vis.messageWidthPx };
	}

	/** Column defs for the plugs SVAR grid — mirrors {@link SetGridTablePresenter['_setsGridColumns']}. */
	private _plugGridColumns(vis: PlugGridVis): IColumn[] {
		return [
			{
				id: 'channelAccount',
				header: vis.accountHeader,
				width: vis.accountWidth,
				cell: PlugsGridAccountCell,
				tooltip: (row: unknown) => this.accountTooltipPlainText(row)
			},
			{
				id: 'likesToTriggerDisplay',
				header: '# of likes',
				width: vis.likesWidthPx,
				hidden: !vis.likes,
				tooltip: false
			},
			{
				id: 'messageDisplay',
				header: 'Message',
				tooltip: false,
				...this._messageDisplayColumnSizing(vis)
			},
			{
				id: 'active',
				header: 'Active',
				width: vis.activeWidthPx,
				cell: PlugsGridActiveCell,
				tooltip: false
			},
			{
				id: 'actions',
				header: 'Actions',
				width: vis.actionsWidthPx,
				cell: PlugsGridActionsCell,
				tooltip: false
			}
		] as unknown as IColumn[];
	}

	getPlugsGridColumnsForViewport(
		layoutTierWidthPx: number,
		plugGridLayoutWidthPx: number,
		browser: boolean
	): IColumn[] {
		const plugGridColumns = this._plugGridColumns(PLUG_GRID_WIDE_DEFAULTS);

		const w = layoutTierWidthPx;
		if (!browser || w <= 0) return plugGridColumns;

		if (w <= 640) {
			const cw = w;
			const activePx = 56;
			const actionsPx = 132;
			const accountPx = Math.max(88, Math.min(116, Math.floor(cw * 0.32)));
			const gutter = 16;
			const messageW = Math.max(72, cw - accountPx - activePx - actionsPx - gutter);
			return this._plugGridColumns({
				likes: false,
				accountWidth: accountPx,
				likesWidthPx: 96,
				messageFlexGrow: false,
				messageWidthPx: messageW,
				actionsWidthPx: actionsPx,
				activeWidthPx: activePx,
				compact: true,
				accountHeader: 'Account'
			});
		}

		const basis = plugGridLayoutWidthPx > 0 ? plugGridLayoutWidthPx : w;

		if (w <= 1024) {
			const accountPx = Math.max(168, Math.min(208, Math.floor(w * 0.22)));
			const likesPx = Math.max(88, Math.min(112, Math.floor(w * 0.11)));
			const activePx = 88;
			const actionsPx = 144;
			const gutter = 28;
			const reserved = accountPx + likesPx + activePx + actionsPx + gutter;
			const messageW = Math.max(100, Math.floor(basis - reserved));
			return this._plugGridColumns({
				...PLUG_GRID_WIDE_DEFAULTS,
				accountWidth: accountPx,
				likesWidthPx: likesPx,
				messageWidthPx: messageW,
				actionsWidthPx: actionsPx
			});
		}

		const gutter = 36;
		const reserved =
			PLUG_GRID_WIDE_DEFAULTS.accountWidth +
			PLUG_GRID_WIDE_DEFAULTS.likesWidthPx +
			PLUG_GRID_WIDE_DEFAULTS.activeWidthPx +
			PLUG_GRID_WIDE_DEFAULTS.actionsWidthPx +
			gutter;
		const messageW = Math.max(120, Math.floor(basis - reserved));
		return this._plugGridColumns({
			...PLUG_GRID_WIDE_DEFAULTS,
			messageWidthPx: messageW
		});
	}

	getPlugsGridSizesForViewport(layoutTierWidthPx: number, browser: boolean): {
		rowHeight: number;
		headerHeight: number;
	} {
		if (!browser || layoutTierWidthPx <= 0) return { rowHeight: 44, headerHeight: 40 };
		if (layoutTierWidthPx <= 640) return { rowHeight: 48, headerHeight: 42 };
		if (layoutTierWidthPx <= 1024) return { rowHeight: 44, headerHeight: 40 };
		return { rowHeight: 44, headerHeight: 40 };
	}

	getPlugsGridAutoRowHeight(layoutTierWidthPx: number, browser: boolean): boolean {
		return Boolean(browser && layoutTierWidthPx > 0);
	}

	plugsGridCellStyle(_row: unknown, column: IColumn): string {
		if (String(column.id ?? '') === 'messageDisplay') {
			return 'white-space:normal;word-break:break-word;overflow-wrap:anywhere;';
		}
		return '';
	}
}
