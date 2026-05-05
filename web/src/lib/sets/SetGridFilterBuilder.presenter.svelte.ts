import type { SetGridTableRowViewModel } from '$lib/sets/SetGridTable.presenter.svelte';

import { socialProviderDisplayLabel } from '$data/social-providers';

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

type SetGridFilterLeafRule = {
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

function isSetGridFilterGroupNode(node: unknown): node is { glue?: string; rules: unknown[] } {
	return typeof node === 'object' && node !== null && Array.isArray((node as { rules?: unknown }).rules);
}

function compileSocialChannelLeaf(rule: SetGridFilterLeafRule): (row: SetGridTableRowViewModel) => boolean {
	const filterKind = rule.filter ?? 'equal';

	if (filterKind === 'equal') {
		return (row) => rowMatchesSocialChannelEqual(row, rule.value);
	}
	if (filterKind === 'notEqual') {
		return (row) => !rowMatchesSocialChannelEqual(row, rule.value);
	}

	const handler = textFilterHandler(filterKind);
	return (row) => handler(row.filterSocialSearchText, rule.value);
}

function compileTagsLeaf(rule: SetGridFilterLeafRule): (row: SetGridTableRowViewModel) => boolean {
	const filterKind = rule.filter ?? 'contains';

	if (filterKind === 'equal') {
		const v = String(rule.value ?? '').trim().toLowerCase();
		return (row) => row.filterTagNamesLower.some((t) => t === v);
	}
	if (filterKind === 'notEqual') {
		const v = String(rule.value ?? '').trim().toLowerCase();
		return (row) => !row.filterTagNamesLower.some((t) => t === v);
	}

	const handler = textFilterHandler(filterKind);
	return (row) => handler(row.filterTagNamesLower.join(' '), rule.value);
}

function compileIncludesLeaf(rule: SetGridFilterLeafRule): (row: SetGridTableRowViewModel) => boolean {
	const field = rule.field;
	const includes = rule.includes ?? [];
	if (!field || !includes.length) return () => true;

	// FilterBuilder's editor uses `includes` to represent multi-select values and will render the rule as “in …”.
	// When the user chooses "not equal", the intent is "not in" for multi-select.
	const negate = (rule.filter ?? 'equal') === 'notEqual';

	const scalars = includes.map((x) =>
		x instanceof Date ? String(x) : String(x ?? '').trim()
	);

	if (field === 'socialChannel') {
		return (row) => {
			const hit = row.filterSocialProviderIdsLower.some((id) =>
				scalars.some((inc) => normalizeSocialProviderIdForFilter(id) === normalizeSocialFilterRuleValue(inc))
			);
			return negate ? !hit : hit;
		};
	}
	if (field === 'tags') {
		const lowered = scalars.map((s) => String(s).toLowerCase());
		return (row) => {
			const hit = row.filterTagNamesLower.some((t) => lowered.includes(t));
			return negate ? !hit : hit;
		};
	}

	return (row) => {
		let cell = '';
		if (field === 'name') cell = row.name;
		else if (field === 'bodyPreview') cell = row.bodyPreview === DASH ? '' : row.bodyPreview;
		const c = cell.trim().toLowerCase();
		const hit = scalars.some((inc) => c === String(inc).trim().toLowerCase());
		return negate ? !hit : hit;
	};
}

function compileSetGridFilterLeaf(rule: SetGridFilterLeafRule): (row: SetGridTableRowViewModel) => boolean {
	const field = rule.field;
	if (!field || field === '*') return () => true;

	if (rule.includes && rule.includes.length > 0) {
		return compileIncludesLeaf(rule);
	}

	if (field === 'socialChannel') return compileSocialChannelLeaf(rule);
	if (field === 'tags') return compileTagsLeaf(rule);

	const filterKind = rule.filter ?? 'equal';
	const handler = textFilterHandler(filterKind);

	return (row) => {
		let cell: unknown = '';
		if (field === 'name') cell = row.name;
		else if (field === 'bodyPreview') cell = row.bodyPreview === DASH ? '' : row.bodyPreview;
		else cell = '';
		return handler(cell, rule.value);
	};
}

function compileSetGridFilterNode(node: unknown): (row: SetGridTableRowViewModel) => boolean {
	if (!node || typeof node !== 'object') return () => true;

	if (isSetGridFilterGroupNode(node)) {
		const { glue = 'and', rules } = node;
		const parts = rules.map(compileSetGridFilterNode).filter((fn) => typeof fn === 'function');
		if (parts.length === 0) return () => true;
		if (glue === 'or') {
			return (row) => parts.some((fn) => fn(row));
		}
		return (row) => parts.every((fn) => fn(row));
	}

	return compileSetGridFilterLeaf(node as SetGridFilterLeafRule);
}


function formatBodyPreviewFilterOption(v: unknown): string {
	const s = typeof v === 'string' ? v : String(v ?? '');
	return s.length > 72 ? `${s.slice(0, 71)}…` : s;
}

export const SET_GRID_FILTER_BUILDER_FIELDS = [
	{ id: 'socialChannel', label: 'Social channel', type: 'text' },
	{ id: 'tags', label: 'Tags', type: 'text' },
	{ id: 'name', label: 'Name', type: 'text' },
	{ id: 'bodyPreview', label: 'Body preview', type: 'text', format: formatBodyPreviewFilterOption }
] as const;

function normalizeSocialProviderIdForFilter(identifier: string): string {
	const id = identifier.trim().toLowerCase();
	if (id.startsWith('instagram')) return 'instagram';
	return id;
}

type SetGridFilterNode = {
	glue?: 'and' | 'or';
	rules?: SetGridFilterNode[];
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};
type FilterBuilderApi = {
	exec: (action: string, payload?: unknown) => void;
};

/**
 * Builds a row predicate from SVAR FilterBuilder serialized state for the templates (sets) grid.
 * Social channel rules treat Instagram variants as one bucket and match when **any** connected channel satisfies the rule.
 */
export function createSetGridTableFilter(filterValue: unknown): (row: SetGridTableRowViewModel) => boolean {
	if (!filterValue || typeof filterValue !== 'object') return () => true;
	const rules = (filterValue as { rules?: unknown }).rules;
	if (!Array.isArray(rules) || rules.length === 0) return () => true;
	return compileSetGridFilterNode(filterValue);
}


function collectUsedFilterFields(node: SetGridFilterNode, out: Set<string>): void {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node.rules)) {
		for (const r of node.rules) collectUsedFilterFields(r, out);
		return;
	}
	const f = String(node.field ?? '').trim();
	if (f) out.add(f);
}

function normalizeFilterBuilderValueForTemplates(v: SetGridFilterNode): SetGridFilterNode {
	const walk = (node: SetGridFilterNode): SetGridFilterNode => {
		if (node && Array.isArray(node.rules)) {
			return {
				...node,
				rules: node.rules.map(walk)
			};
		}

		const field = String(node?.field ?? '');
		if ((field === 'socialChannel' || field === 'tags') && Array.isArray(node.includes) && node.includes.length) {
			const filterKind = String(node.filter ?? 'equal');
			const values = node.includes.map((x) => String(x ?? '').trim()).filter(Boolean);
			if (values.length === 0) {
				return { ...node, includes: [] };
			}

			// To render “contains/=” chips (not “in …”), we must avoid `includes` entirely.
			// We explode multi-select into a group of leaf rules.
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


const DASH = '—';

function normalizeSocialFilterRuleValue(raw: unknown): string {
	const s = String(raw ?? '').trim().toLowerCase();
	if (!s) return '';
	if (s.startsWith('instagram')) return 'instagram';
	if (s === 'thread') return 'threads';
	return s;
}

function rowMatchesSocialChannelEqual(row: SetGridTableRowViewModel, raw: unknown): boolean {
	const want = normalizeSocialFilterRuleValue(raw);
	if (!want) return true;
	for (const idRaw of row.filterSocialProviderIdsLower) {
		if (normalizeSocialProviderIdForFilter(idRaw) === want) return true;
	}
	const d = row.channelsDisplayVm;
	if (d) {
		for (const ch of d.allVm) {
			if (socialProviderDisplayLabel(ch.providerIdentifier).toLowerCase() === String(raw ?? '').trim().toLowerCase()) {
				return true;
			}
		}
	}
	return false;
}

/**
 * Feature presenter for the Templates grid FilterBuilder.
 *
 * Owns:
 * - FilterBuilder serialized value (normalized so chips render “contains/=” instead of “in …”)
 * - FilterBuilder API reference for “Add filter” dropdown
 * - Add-filter menu state + available field list
 *
 * Does not call repositories/gateways; route binds it to the FilterBuilder component and Grid API.
 */
export class SetGridFilterBuilderPresenter {
	value = $state<{ glue: 'and' | 'or'; rules: unknown[] }>({ glue: 'or', rules: [] });
	private _api = $state<FilterBuilderApi | undefined>(undefined);
	addFilterMenuOpen = $state(false);
	readonly fields = SET_GRID_FILTER_BUILDER_FIELDS;

	get hasAnyRule(): boolean {
		return Array.isArray(this.value.rules) && this.value.rules.length > 0;
	}

	get isReady(): boolean {
		return this._api != null;
	}

	/** Options map for FilterBuilder's editor dropdowns (depends on current grid rows). */
	buildOptions(rows: readonly SetGridTableRowViewModel[]): Record<string, string[]> {
		const platformByNorm = new Map<string, { id: string; label: string }>();
		for (const r of rows) {
			for (const rawId of r.filterSocialProviderIdsLower) {
				const norm = normalizeSocialProviderIdForFilter(rawId);
				if (!platformByNorm.has(norm)) {
					platformByNorm.set(norm, { id: rawId, label: socialProviderDisplayLabel(rawId) });
				}
			}
		}
		const socialChannel = [...platformByNorm.values()]
			.sort((a, b) => a.label.localeCompare(b.label))
			.map((o) => o.label);

		const tagSeen = new Map<string, string>();
		for (const r of rows) {
			for (const chip of r.tagsDisplayVm) {
				const name = chip.name.trim();
				if (name.length === 0) continue;
				const key = name.toLowerCase();
				if (!tagSeen.has(key)) tagSeen.set(key, name);
			}
		}
		const tags = [...tagSeen.values()].sort((a, b) => a.localeCompare(b));

		const name = [...new Set(rows.map((r) => r.name.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));

		const MAX_BODY_OPTIONS = 80;
		const bodyPreview = [
			...new Set(rows.map((r) => (r.bodyPreview && r.bodyPreview !== '—' ? r.bodyPreview.trim() : '')).filter(Boolean))
		]
			.sort((a, b) => a.localeCompare(b))
			.slice(0, MAX_BODY_OPTIONS);

		return { socialChannel, tags, name, bodyPreview };
	}

	get addableFieldOptions(): { id: string; label: string }[] {
		const used = new Set<string>();
		collectUsedFilterFields(this.value as unknown as SetGridFilterNode, used);
		return SET_GRID_FILTER_BUILDER_FIELDS.filter((f) => !used.has(f.id)).map((f) => ({
			id: f.id,
			label: f.label
		}));
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

	/** Wire SVAR FilterBuilder API via its `init` prop. */
	initFilterBuilderApi(api: unknown): void {
		this._api = api as FilterBuilderApi;
	}

	/** Called from FilterBuilder `onchange`. */
	applyChange(ev: { value: { glue: 'and' | 'or'; rules: unknown[] } }): void {
		const normalized = normalizeFilterBuilderValueForTemplates(ev.value as unknown as SetGridFilterNode);
		this.value = normalized as typeof this.value;
	}

	addFilterForField(fieldId: string): void {
		this.addFilterMenuOpen = false;
		const api = this._api;
		if (!api) return;
		api.exec('add-rule', { rule: { $temp: true, field: fieldId }, edit: true });
	}
}

