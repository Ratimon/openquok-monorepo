import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';

/**
 * Plug grid filter-builder presenter (Account → Plugs).
 *
 * Owns FilterBuilder value + API ref + add-filter dropdown state.
 * No repository/gateway calls.
 */

/**
 * Matches `@svar-ui/filter-store` default **text** operators used by FilterBuilder.
 * Kept in the filter feature (shared by FilterBuilder + grid predicate compilation).
 */
export function textFilterHandler(filterKind: string | undefined): (cell: unknown, value: unknown) => boolean {
	switch (filterKind ?? 'equal') {
		case 'equal':
			return (t, e) => t != null && String(t).toLowerCase() === String(e ?? '').toLowerCase();
		case 'notEqual':
			return (t, e) => t == null || String(t).toLowerCase() !== String(e ?? '').toLowerCase();
		case 'contains':
			return (t, e) => t != null && String(t).toLowerCase().includes(String(e ?? '').toLowerCase());
		case 'notContains':
			return (t, e) => t == null || !String(t).toLowerCase().includes(String(e ?? '').toLowerCase());
		case 'beginsWith':
			return (t, e) => {
				if (t == null) return false;
				const a = String(t).toLowerCase();
				const b = String(e ?? '').toLowerCase();
				return a.lastIndexOf(b, 0) === 0;
			};
		case 'notBeginsWith':
			return (t, e) => {
				if (t == null) return true;
				const a = String(t).toLowerCase();
				const b = String(e ?? '').toLowerCase();
				return a.lastIndexOf(b, 0) !== 0;
			};
		case 'endsWith':
			return (t, e) => {
				if (t == null) return false;
				const a = String(t).toLowerCase();
				const b = String(e ?? '').toLowerCase();
				return a.indexOf(b, Math.max(0, a.length - b.length)) !== -1;
			};
		case 'notEndsWith':
			return (t, e) => {
				if (t == null) return true;
				const a = String(t).toLowerCase();
				const b = String(e ?? '').toLowerCase();
				return a.indexOf(b, Math.max(0, a.length - b.length)) === -1;
			};
		default:
			return (t, e) => t != null && String(t).toLowerCase() === String(e ?? '').toLowerCase();
	}
}

type PlugGridFilterLeafRule = {
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

function isPlugGridFilterGroupNode(node: unknown): node is { glue?: string; rules: unknown[] } {
	return typeof node === 'object' && node !== null && Array.isArray((node as { rules?: unknown }).rules);
}

function compilePlugGridIncludesLeaf(rule: PlugGridFilterLeafRule): (row: PlugRuleTableRowViewModel) => boolean {
	const field = rule.field;
	const includes = rule.includes ?? [];
	if (!field || !includes.length) return () => true;
	const negate = (rule.filter ?? 'equal') === 'notEqual';
	const values = includes.map((x) => String(x ?? '').trim().toLowerCase()).filter(Boolean);

	return (row) => {
		const cell = String(rowValueForField(row, field) ?? '').trim().toLowerCase();
		const hit = values.includes(cell);
		return negate ? !hit : hit;
	};
}

function compilePlugGridLeaf(rule: PlugGridFilterLeafRule): (row: PlugRuleTableRowViewModel) => boolean {
	const field = rule.field;
	if (!field || field === '*') return () => true;
	if (rule.includes && rule.includes.length) return compilePlugGridIncludesLeaf(rule);

	const handler = textFilterHandler(rule.filter);
	return (row) => handler(rowValueForField(row, field), rule.value);
}

function compilePlugGridNode(node: unknown): (row: PlugRuleTableRowViewModel) => boolean {
	if (!node || typeof node !== 'object') return () => true;
	if (isPlugGridFilterGroupNode(node)) {
		const { glue = 'and', rules } = node;
		const parts = rules.map(compilePlugGridNode);
		if (!parts.length) return () => true;
		return glue === 'or'
			? (row) => parts.some((fn) => fn(row))
			: (row) => parts.every((fn) => fn(row));
	}
	return compilePlugGridLeaf(node as PlugGridFilterLeafRule);
}

function rowValueForField(row: PlugRuleTableRowViewModel, field: string): unknown {
	switch (field) {
		case 'platformLabel':
			return row.platformLabel;
		case 'channelName':
			return row.channelName;
		case 'ruleTitle':
			return row.ruleTitle;
		case 'messageDisplay':
			return row.messageDisplay === '—' ? '' : row.messageDisplay;
		case 'likesToTriggerDisplay':
			return row.likesToTriggerDisplay === '—' ? '' : row.likesToTriggerDisplay;
		case 'activated':
			return row.activated ? 'Active' : 'Paused';
		default:
			return '';
	}
}

/** Builds a row predicate from SVAR FilterBuilder serialized state for the plugs grid. */
export function createPlugGridTableFilter(filterValue: unknown): (row: PlugRuleTableRowViewModel) => boolean {
	if (!filterValue || typeof filterValue !== 'object') return () => true;
	const rules = (filterValue as { rules?: unknown }).rules;
	if (!Array.isArray(rules) || rules.length === 0) return () => true;
	return compilePlugGridNode(filterValue);
}

type PlugGridFilterNode = {
	glue?: 'and' | 'or';
	rules?: PlugGridFilterNode[];
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

type FilterBuilderApi = {
	exec: (action: string, payload?: unknown) => void;
};

function formatMessagePreviewOption(v: unknown): string {
	const s = typeof v === 'string' ? v : String(v ?? '');
	return s.length > 72 ? `${s.slice(0, 71)}…` : s;
}

export const PLUG_GRID_FILTER_BUILDER_FIELDS = [
	{ id: 'platformLabel', label: 'Social channel', type: 'text' },
	{ id: 'channelName', label: 'Connected account', type: 'text' },
	{ id: 'ruleTitle', label: 'Rule', type: 'text' },
	{ id: 'messageDisplay', label: 'Message', type: 'text', format: formatMessagePreviewOption },
	{ id: 'likesToTriggerDisplay', label: '# of likes', type: 'text' },
	{ id: 'activated', label: 'Active', type: 'text' }
] as const;

function collectUsedFilterFields(node: PlugGridFilterNode, out: Set<string>): void {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node.rules)) {
		for (const r of node.rules) collectUsedFilterFields(r, out);
		return;
	}
	const f = String(node.field ?? '').trim();
	if (f) out.add(f);
}

function normalizeFilterBuilderValueForPlugs(v: PlugGridFilterNode): PlugGridFilterNode {
	const walk = (node: PlugGridFilterNode): PlugGridFilterNode => {
		if (node && Array.isArray(node.rules)) {
			return { ...node, rules: node.rules.map(walk) };
		}

		const field = String(node?.field ?? '');
		if (
			(field === 'platformLabel' || field === 'channelName' || field === 'ruleTitle') &&
			Array.isArray(node.includes) &&
			node.includes.length
		) {
			const filterKind = String(node.filter ?? 'equal');
			const values = node.includes.map((x) => String(x ?? '').trim()).filter(Boolean);
			if (values.length === 0) return { ...node, includes: [] };

			// Avoid “in …” chips by converting multi-select → value rules.
			const glue: 'and' | 'or' = filterKind === 'notEqual' ? 'and' : 'or';
			return {
				glue,
				rules: values.map((value) => ({
					field,
					filter: filterKind,
					type: 'text',
					value,
					includes: []
				}))
			};
		}

		return node;
	};
	return walk(v);
}

export class PlugGridFilterBuilderPresenter {
	value = $state<{ glue: 'and' | 'or'; rules: unknown[] }>({ glue: 'or', rules: [] });
	private _api = $state<FilterBuilderApi | undefined>(undefined);
	addFilterMenuOpen = $state(false);
	readonly fields = PLUG_GRID_FILTER_BUILDER_FIELDS;

	get hasAnyRule(): boolean {
		return Array.isArray(this.value.rules) && this.value.rules.length > 0;
	}

	get isReady(): boolean {
		return this._api != null;
	}

	reset(): void {
		this.addFilterMenuOpen = false;
		this.value = { glue: 'or', rules: [] };
	}

	toggleAddFilterMenu(): void {
		this.addFilterMenuOpen = !this.addFilterMenuOpen;
	}

	closeAddFilterMenu(): void {
		this.addFilterMenuOpen = false;
	}

	initFilterBuilderApi(api: unknown): void {
		this._api = api as FilterBuilderApi;
	}

	applyChange(ev: { value: { glue: 'and' | 'or'; rules: unknown[] } }): void {
		const normalized = normalizeFilterBuilderValueForPlugs(ev.value as unknown as PlugGridFilterNode);
		this.value = normalized as typeof this.value;
	}

	get addableFieldOptions(): { id: string; label: string }[] {
		const used = new Set<string>();
		collectUsedFilterFields(this.value as unknown as PlugGridFilterNode, used);
		return PLUG_GRID_FILTER_BUILDER_FIELDS.filter((f) => !used.has(f.id)).map((f) => ({
			id: f.id,
			label: f.label
		}));
	}

	addFilterForField(fieldId: string): void {
		this.addFilterMenuOpen = false;
		const api = this._api;
		if (!api) return;
		api.exec('add-rule', { rule: { $temp: true, field: fieldId }, edit: true });
	}

	buildOptions(rows: readonly PlugRuleTableRowViewModel[]): Record<string, string[]> {
		const platformLabel = [...new Set(rows.map((r) => String(r.platformLabel ?? '').trim()).filter(Boolean))].sort(
			(a, b) => a.localeCompare(b)
		);
		const channelName = [...new Set(rows.map((r) => String(r.channelName ?? '').trim()).filter(Boolean))].sort(
			(a, b) => a.localeCompare(b)
		);
		const ruleTitle = [...new Set(rows.map((r) => String(r.ruleTitle ?? '').trim()).filter(Boolean))].sort(
			(a, b) => a.localeCompare(b)
		);
		const MAX_MESSAGE_OPTIONS = 80;
		const messageDisplay = [
			...new Set(
				rows
					.map((r) => String(r.messageDisplay ?? '').trim())
					.filter((x) => x.length > 0 && x !== '—')
			)
		]
			.sort((a, b) => a.localeCompare(b))
			.slice(0, MAX_MESSAGE_OPTIONS);
		const likesToTriggerDisplay = [
			...new Set(rows.map((r) => String(r.likesToTriggerDisplay ?? '').trim()).filter((x) => x.length && x !== '—'))
		].sort((a, b) => a.localeCompare(b));
		const activated = ['Active', 'Paused'];

		return { platformLabel, channelName, ruleTitle, messageDisplay, likesToTriggerDisplay, activated };
	}
}
