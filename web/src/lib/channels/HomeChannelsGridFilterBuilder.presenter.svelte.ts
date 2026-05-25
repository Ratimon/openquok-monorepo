import type { HomeChannelTableRowViewModel } from '$lib/channels/HomeChannelsGridTable.presenter.svelte';
import { HOME_CHANNEL_UNGROUPED_GROUP_LABEL } from '$lib/channels/HomeChannelsGridTable.presenter.svelte';

import { textFilterHandler } from '$lib/plugs/PlugGridFilterBuilder.presenter.svelte';

/**
 * Home channels grid filter-builder presenter (Account → Connected channels table).
 */

type HomeChannelsFilterLeafRule = {
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

function isHomeChannelsFilterGroupNode(node: unknown): node is { glue?: string; rules: unknown[] } {
	return typeof node === 'object' && node !== null && Array.isArray((node as { rules?: unknown }).rules);
}

function rowValueForField(row: HomeChannelTableRowViewModel, field: string): unknown {
	switch (field) {
		case 'platformLabel':
			return row.platformLabel;
		case 'channelName':
			return row.channelName;
		case 'groupName':
			return row.groupName;
		case 'statusDisplay':
			return row.statusDisplay;
		default:
			return '';
	}
}

function compileHomeChannelsIncludesLeaf(
	rule: HomeChannelsFilterLeafRule
): (row: HomeChannelTableRowViewModel) => boolean {
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

function compileHomeChannelsLeaf(
	rule: HomeChannelsFilterLeafRule
): (row: HomeChannelTableRowViewModel) => boolean {
	const field = rule.field;
	if (!field || field === '*') return () => true;
	if (rule.includes && rule.includes.length) return compileHomeChannelsIncludesLeaf(rule);

	const handler = textFilterHandler(rule.filter);
	return (row) => handler(rowValueForField(row, field), rule.value);
}

function compileHomeChannelsNode(node: unknown): (row: HomeChannelTableRowViewModel) => boolean {
	if (!node || typeof node !== 'object') return () => true;
	if (isHomeChannelsFilterGroupNode(node)) {
		const { glue = 'and', rules } = node;
		const parts = rules.map(compileHomeChannelsNode);
		if (!parts.length) return () => true;
		return glue === 'or'
			? (row) => parts.some((fn) => fn(row))
			: (row) => parts.every((fn) => fn(row));
	}
	return compileHomeChannelsLeaf(node as HomeChannelsFilterLeafRule);
}

/** Builds a row predicate from SVAR FilterBuilder serialized state for the home channels grid. */
export function createHomeChannelsGridTableFilter(
	filterValue: unknown
): (row: HomeChannelTableRowViewModel) => boolean {
	if (!filterValue || typeof filterValue !== 'object') return () => true;
	const rules = (filterValue as { rules?: unknown }).rules;
	if (!Array.isArray(rules) || rules.length === 0) return () => true;
	return compileHomeChannelsNode(filterValue);
}

type HomeChannelsFilterNode = {
	glue?: 'and' | 'or';
	rules?: HomeChannelsFilterNode[];
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

type FilterBuilderApi = {
	exec: (action: string, payload?: unknown) => void;
};

export const HOME_CHANNELS_GRID_FILTER_BUILDER_FIELDS = [
	{ id: 'platformLabel', label: 'Social platform', type: 'text' },
	{ id: 'channelName', label: 'Connected account', type: 'text' },
	{ id: 'groupName', label: 'Group name', type: 'text' },
	{ id: 'statusDisplay', label: 'Status', type: 'text' }
] as const;

function collectUsedFilterFields(node: HomeChannelsFilterNode, out: Set<string>): void {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node.rules)) {
		for (const r of node.rules) collectUsedFilterFields(r, out);
		return;
	}
	const f = String(node.field ?? '').trim();
	if (f) out.add(f);
}

function normalizeFilterBuilderValueForHomeChannels(
	v: HomeChannelsFilterNode
): HomeChannelsFilterNode {
	const walk = (node: HomeChannelsFilterNode): HomeChannelsFilterNode => {
		if (node && Array.isArray(node.rules)) {
			return { ...node, rules: node.rules.map(walk) };
		}

		const field = String(node?.field ?? '');
		if (
			(field === 'platformLabel' || field === 'channelName' || field === 'groupName') &&
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

export class HomeChannelsGridFilterBuilderPresenter {
	value = $state<{ glue: 'and' | 'or'; rules: unknown[] }>({ glue: 'or', rules: [] });
	private _api = $state<FilterBuilderApi | undefined>(undefined);
	addFilterMenuOpen = $state(false);
	readonly fields = HOME_CHANNELS_GRID_FILTER_BUILDER_FIELDS;

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
		const normalized = normalizeFilterBuilderValueForHomeChannels(
			ev.value as unknown as HomeChannelsFilterNode
		);
		this.value = normalized as typeof this.value;
	}

	get addableFieldOptions(): { id: string; label: string }[] {
		const used = new Set<string>();
		collectUsedFilterFields(this.value as unknown as HomeChannelsFilterNode, used);
		return HOME_CHANNELS_GRID_FILTER_BUILDER_FIELDS.filter((f) => !used.has(f.id)).map((f) => ({
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

	buildOptions(rows: readonly HomeChannelTableRowViewModel[]): Record<string, string[]> {
		const platformLabel = [
			...new Set(rows.map((r) => String(r.platformLabel ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const channelName = [
			...new Set(rows.map((r) => String(r.channelName ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const groupName = [
			...new Set(rows.map((r) => String(r.groupName ?? '').trim()).filter(Boolean))
		].sort((a, b) => {
			if (a === HOME_CHANNEL_UNGROUPED_GROUP_LABEL) return 1;
			if (b === HOME_CHANNEL_UNGROUPED_GROUP_LABEL) return -1;
			return a.localeCompare(b);
		});
		const statusDisplay = [
			...new Set(rows.map((r) => String(r.statusDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));

		return { platformLabel, channelName, groupName, statusDisplay };
	}
}
