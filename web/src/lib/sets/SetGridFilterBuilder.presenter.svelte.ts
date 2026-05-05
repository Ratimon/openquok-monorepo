import type { SetGridTableRowViewModel } from '$lib/sets/SetGridTable.presenter.svelte';

import { socialProviderDisplayLabel } from '$data/social-providers';

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

type FilterNode = {
	glue?: 'and' | 'or';
	rules?: FilterNode[];
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

type FilterBuilderApi = {
	exec: (action: string, payload?: unknown) => void;
};

function collectUsedFilterFields(node: FilterNode, out: Set<string>): void {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node.rules)) {
		for (const r of node.rules) collectUsedFilterFields(r, out);
		return;
	}
	const f = String(node.field ?? '').trim();
	if (f) out.add(f);
}

function normalizeFilterBuilderValueForTemplates(v: FilterNode): FilterNode {
	const walk = (node: FilterNode): FilterNode => {
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
		collectUsedFilterFields(this.value as unknown as FilterNode, used);
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
		const normalized = normalizeFilterBuilderValueForTemplates(ev.value as unknown as FilterNode);
		this.value = normalized as typeof this.value;
	}

	addFilterForField(fieldId: string): void {
		this.addFilterMenuOpen = false;
		const api = this._api;
		if (!api) return;
		api.exec('add-rule', { rule: { $temp: true, field: fieldId }, edit: true });
	}
}

