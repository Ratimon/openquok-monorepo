import type { ConnectedIntegrationProgrammerModel } from '$lib/integrations/Integrations.repository.svelte';
import type {
	GlobalPlugCatalogEntryProgrammerModel,
	IntegrationPlugRowProgrammerModel,
	PlugCatalogProviderProgrammerModel
} from '$lib/plugs/Plug.repository.svelte';

/** Catalog slice shown on the plugs screen (wire shape matches PM after repository mapping). */
export type PlugCatalogProviderViewModel = PlugCatalogProviderProgrammerModel;

/** Connected channel row for plugs lists (wire shape matches integration list PM). */
export type ConnectedIntegrationChannelViewModel = ConnectedIntegrationProgrammerModel;

/** One row in the plugs table / SVAR grid. */
export interface PlugRuleTableRowViewModel {
	id: string;
	integrationId: string;
	channelName: string;
	channelPicture: string | null;
	platformKey: string;
	platformLabel: string;
	ruleTitle: string;
	scheduleSummary: string;
	/** Threshold-style trigger (e.g. catalog field `likesAmount`). */
	likesToTriggerDisplay: string;
	/** Reply / plug body text (e.g. catalog field `post`). */
	messageDisplay: string;
	activated: boolean;
	plugRowPm: IntegrationPlugRowProgrammerModel;
	catalogEntry: GlobalPlugCatalogEntryProgrammerModel | null;
}

export class GetPlugPresenter {
	/** JSON array `{ name, value }[]` from API `data` field → map for form / display. */
	parseRowData(row: IntegrationPlugRowProgrammerModel | undefined): Record<string, string> {
		if (!row?.data) return {};
		try {
			const raw = JSON.parse(row.data) as { name?: string; value?: string }[];
			if (!Array.isArray(raw)) return {};
			return raw.reduce<Record<string, string>>((acc, x) => {
				if (x.name) acc[x.name] = String(x.value ?? '');
				return acc;
			}, {});
		} catch {
			return {};
		}
	}

	private formatPlatformLabel(
		ch: ConnectedIntegrationChannelViewModel,
		catalogForProvider: PlugCatalogProviderViewModel | undefined
	): string {
		return catalogForProvider?.name?.trim() || this.capitalizeWord(ch.identifier ?? '');
	}

	private capitalizeWord(s: string): string {
		const t = s.trim();
		if (!t.length) return s;
		return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
	}

	private scheduleSummaryFromDef(def: GlobalPlugCatalogEntryProgrammerModel | null): string {
		if (!def) return '—';
		const hours = Math.round(def.runEveryMilliseconds / 3600000);
		const runs = def.totalRuns;
		return `Every ${hours}h · up to ${runs} run${runs === 1 ? '' : 's'}`;
	}

	/**
	 * Maps stored field values to grid columns. Threads global plug uses `likesAmount` + `post`;
	 * other providers fall back to first `number` field and first `richtext` / `post`-named field.
	 */
	private likesAndMessageDisplay(
		def: GlobalPlugCatalogEntryProgrammerModel | null,
		row: IntegrationPlugRowProgrammerModel
	): { likes: string; message: string } {
		const values = this.parseRowData(row);
		const dash = '—';

		const likesFieldName = def?.fields.find(
			(f) => f.name === 'likesAmount' || f.type === 'number'
		)?.name;
		const messageFieldName =
			def?.fields.find((f) => f.name === 'post' || f.name === 'message')?.name ??
			def?.fields.find((f) => f.type === 'richtext')?.name ??
			def?.fields.find(
				(f) =>
					f.type !== 'number' &&
					f.name !== likesFieldName &&
					(f.type === 'text' || f.type === 'richtext')
			)?.name;

		let likes = likesFieldName ? (values[likesFieldName] ?? '').trim() : '';
		let message = messageFieldName ? (values[messageFieldName] ?? '').trim() : '';

		if (!likes && !message && def?.fields?.length === 2) {
			const [a, b] = def.fields;
			const va = (values[a.name] ?? '').trim();
			const vb = (values[b.name] ?? '').trim();
			if (a.type === 'number' && b.type === 'richtext') {
				likes = va;
				message = vb;
			} else if (b.type === 'number' && a.type === 'richtext') {
				likes = vb;
				message = va;
			}
		}

		if (!likes && !likesFieldName) {
			likes = (values.likesAmount ?? '').trim();
		}
		if (!message) {
			message = (values.post ?? values.message ?? '').trim();
		}

		return {
			likes: likes.length ? likes : dash,
			message: message.length ? message : dash
		};
	}

	toPlugRuleTableRowViewModel(params: {
		channel: ConnectedIntegrationChannelViewModel;
		catalogForProvider: PlugCatalogProviderViewModel | undefined;
		rowPm: IntegrationPlugRowProgrammerModel;
	}): PlugRuleTableRowViewModel {
		const { channel, catalogForProvider, rowPm } = params;
		const catalogEntry =
			catalogForProvider?.plugs.find((p) => p.methodName === rowPm.plug_function) ?? null;

		const { likes, message } = this.likesAndMessageDisplay(catalogEntry, rowPm);

		return {
			id: rowPm.id,
			integrationId: channel.id,
			channelName: channel.name,
			channelPicture: channel.picture,
			platformKey: (channel.identifier ?? '').toLowerCase(),
			platformLabel: this.formatPlatformLabel(channel, catalogForProvider),
			ruleTitle: catalogEntry?.title ?? rowPm.plug_function,
			scheduleSummary: this.scheduleSummaryFromDef(catalogEntry),
			likesToTriggerDisplay: likes,
			messageDisplay: message,
			activated: rowPm.activated === true,
			plugRowPm: rowPm,
			catalogEntry
		};
	}
}
