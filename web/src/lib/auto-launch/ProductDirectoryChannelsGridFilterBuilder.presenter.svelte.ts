import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

import { textFilterHandler } from '$lib/plugs/PlugGridFilterBuilder.presenter.svelte';

type DirectoryChannelsFilterLeafRule = {
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

function isFilterGroupNode(node: unknown): node is { glue?: string; rules: unknown[] } {
	return typeof node === 'object' && node !== null && Array.isArray((node as { rules?: unknown }).rules);
}

function rowValueForField(row: ProductDirectoryChannelTableRowViewModel, field: string): unknown {
	switch (field) {
		case 'siteLabel':
			return row.rowKind === 'opportunity'
				? `${row.siteLabel} ${row.opportunityLabel}`.trim()
				: row.siteLabel;
		case 'listUrlDisplay':
			return row.listUrlDisplay;
		case 'listingDofollowDisplay':
		case 'linkTypeDisplay':
			return row.linkTypeDisplay;
		case 'catalogDrDisplay':
			return row.catalogDrDisplay;
		case 'catalogDrUpdatedDisplay':
			return row.catalogDrUpdatedDisplay;
		case 'authEmailDisplay':
			return row.authEmailDisplay;
		case 'readinessDisplay':
			return row.readinessDisplay;
		case 'submissionDisplay':
			return row.submissionDisplay;
		default:
			return '';
	}
}

function compileIncludesLeaf(
	rule: DirectoryChannelsFilterLeafRule
): (row: ProductDirectoryChannelTableRowViewModel) => boolean {
	const field = rule.field;
	const includes = rule.includes ?? [];
	if (!field || !includes.length) return () => true;
	const negate = (rule.filter ?? 'equal') === 'notEqual';
	const values = includes.map((x) => String(x ?? '').trim().toLowerCase()).filter(Boolean);

	return (row) => {
		const cell = String(rowValueForField(row, field) ?? '')
			.trim()
			.toLowerCase();
		const hit = values.includes(cell);
		return negate ? !hit : hit;
	};
}

function compileLeaf(
	rule: DirectoryChannelsFilterLeafRule
): (row: ProductDirectoryChannelTableRowViewModel) => boolean {
	const field = rule.field;
	if (!field || field === '*') return () => true;
	if (rule.includes && rule.includes.length) return compileIncludesLeaf(rule);

	const handler = textFilterHandler(rule.filter);
	return (row) => handler(rowValueForField(row, field), rule.value);
}

function compileNode(node: unknown): (row: ProductDirectoryChannelTableRowViewModel) => boolean {
	if (!node || typeof node !== 'object') return () => true;
	if (isFilterGroupNode(node)) {
		const { glue = 'and', rules } = node;
		const parts = rules.map(compileNode);
		if (!parts.length) return () => true;
		return glue === 'or'
			? (row) => parts.some((fn) => fn(row))
			: (row) => parts.every((fn) => fn(row));
	}
	return compileLeaf(node as DirectoryChannelsFilterLeafRule);
}

export function createProductDirectoryChannelsGridTableFilter(
	filterValue: unknown
): (row: ProductDirectoryChannelTableRowViewModel) => boolean {
	if (!filterValue || typeof filterValue !== 'object') return () => true;
	const rules = (filterValue as { rules?: unknown }).rules;
	if (!Array.isArray(rules) || rules.length === 0) return () => true;
	return compileNode(filterValue);
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

export const PRODUCT_DIRECTORY_CHANNELS_GRID_FILTER_FIELDS = [
	{ id: 'siteLabel', label: 'Directory', type: 'text' },
	{ id: 'listUrlDisplay', label: 'List URL', type: 'text' },
	{ id: 'submissionDisplay', label: 'Status', type: 'text' },
	{ id: 'catalogDrDisplay', label: 'DR', type: 'text' },
	{ id: 'catalogDrUpdatedDisplay', label: 'DR updated', type: 'text' },
	{ id: 'linkTypeDisplay', label: 'Link type', type: 'text' },
	{ id: 'readinessDisplay', label: 'Readiness', type: 'text' },
	{ id: 'authEmailDisplay', label: 'Auth email', type: 'text' }
] as const;

function collectUsedFilterFields(node: FilterNode, out: Set<string>): void {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node.rules)) {
		for (const r of node.rules) collectUsedFilterFields(r, out);
		return;
	}
	const f = String(node.field ?? '').trim();
	if (f) out.add(f);
}

function normalizeFilterBuilderValue(v: FilterNode): FilterNode {
	const walk = (node: FilterNode): FilterNode => {
		if (node && Array.isArray(node.rules)) {
			return { ...node, rules: node.rules.map(walk) };
		}

		const field = String(node?.field ?? '');
		if (
			(field === 'siteLabel' ||
				field === 'listUrlDisplay' ||
				field === 'linkTypeDisplay' ||
				field === 'catalogDrDisplay' ||
				field === 'catalogDrUpdatedDisplay' ||
				field === 'authEmailDisplay' ||
				field === 'readinessDisplay' ||
				field === 'submissionDisplay') &&
			Array.isArray(node.includes) &&
			node.includes.length
		) {
			const filterKind = String(node.filter ?? 'equal');
			const values = node.includes.map((x) => String(x ?? '').trim()).filter(Boolean);
			if (values.length === 0) return { ...node, includes: [] };

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

export class ProductDirectoryChannelsGridFilterBuilderPresenter {
	value = $state<{ glue: 'and' | 'or'; rules: unknown[] }>({ glue: 'or', rules: [] });
	private _api = $state<FilterBuilderApi | undefined>(undefined);
	addFilterMenuOpen = $state(false);
	readonly fields = PRODUCT_DIRECTORY_CHANNELS_GRID_FILTER_FIELDS;

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
		const normalized = normalizeFilterBuilderValue(ev.value as unknown as FilterNode);
		this.value = normalized as typeof this.value;
	}

	get addableFieldOptions(): { id: string; label: string }[] {
		const used = new Set<string>();
		collectUsedFilterFields(this.value as unknown as FilterNode, used);
		return PRODUCT_DIRECTORY_CHANNELS_GRID_FILTER_FIELDS.filter((f) => !used.has(f.id)).map((f) => ({
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

	buildOptions(rows: readonly ProductDirectoryChannelTableRowViewModel[]): Record<string, string[]> {
		const siteLabel = [
			...new Set(rows.map((r) => String(r.siteLabel ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const listUrlDisplay = [
			...new Set(rows.map((r) => String(r.listUrlDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const linkTypeDisplay = [
			...new Set(rows.map((r) => String(r.linkTypeDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const catalogDrDisplay = [
			...new Set(rows.map((r) => String(r.catalogDrDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const catalogDrUpdatedDisplay = [
			...new Set(rows.map((r) => String(r.catalogDrUpdatedDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const submissionDisplay = [
			...new Set(rows.map((r) => String(r.submissionDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const authEmailDisplay = [
			...new Set(rows.map((r) => String(r.authEmailDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const readinessDisplay = [
			...new Set(rows.map((r) => String(r.readinessDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		return {
			siteLabel,
			listUrlDisplay,
			submissionDisplay,
			catalogDrDisplay,
			catalogDrUpdatedDisplay,
			linkTypeDisplay,
			authEmailDisplay,
			readinessDisplay
		};
	}
}
