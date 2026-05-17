import type { DashboardChannelTableRowViewModel } from '$lib/channels/DashboardChannelsGridTable.presenter.svelte';
import { DASHBOARD_CHANNEL_UNGROUPED_GROUP_LABEL } from '$lib/channels/DashboardChannelsGridTable.presenter.svelte';

import { textFilterHandler } from '$lib/plugs/PlugGridFilterBuilder.presenter.svelte';

/**
 * Dashboard channels grid filter-builder presenter (Account → Connected channels table).
 */

type DashboardChannelsFilterLeafRule = {
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

function isDashboardChannelsFilterGroupNode(node: unknown): node is { glue?: string; rules: unknown[] } {
	return typeof node === 'object' && node !== null && Array.isArray((node as { rules?: unknown }).rules);
}

function rowValueForField(row: DashboardChannelTableRowViewModel, field: string): unknown {
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

function compileDashboardChannelsIncludesLeaf(
	rule: DashboardChannelsFilterLeafRule
): (row: DashboardChannelTableRowViewModel) => boolean {
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

function compileDashboardChannelsLeaf(
	rule: DashboardChannelsFilterLeafRule
): (row: DashboardChannelTableRowViewModel) => boolean {
	const field = rule.field;
	if (!field || field === '*') return () => true;
	if (rule.includes && rule.includes.length) return compileDashboardChannelsIncludesLeaf(rule);

	const handler = textFilterHandler(rule.filter);
	return (row) => handler(rowValueForField(row, field), rule.value);
}

function compileDashboardChannelsNode(node: unknown): (row: DashboardChannelTableRowViewModel) => boolean {
	if (!node || typeof node !== 'object') return () => true;
	if (isDashboardChannelsFilterGroupNode(node)) {
		const { glue = 'and', rules } = node;
		const parts = rules.map(compileDashboardChannelsNode);
		if (!parts.length) return () => true;
		return glue === 'or'
			? (row) => parts.some((fn) => fn(row))
			: (row) => parts.every((fn) => fn(row));
	}
	return compileDashboardChannelsLeaf(node as DashboardChannelsFilterLeafRule);
}

/** Builds a row predicate from SVAR FilterBuilder serialized state for the dashboard channels grid. */
export function createDashboardChannelsGridTableFilter(
	filterValue: unknown
): (row: DashboardChannelTableRowViewModel) => boolean {
	if (!filterValue || typeof filterValue !== 'object') return () => true;
	const rules = (filterValue as { rules?: unknown }).rules;
	if (!Array.isArray(rules) || rules.length === 0) return () => true;
	return compileDashboardChannelsNode(filterValue);
}

type DashboardChannelsFilterNode = {
	glue?: 'and' | 'or';
	rules?: DashboardChannelsFilterNode[];
	field?: string;
	filter?: string;
	value?: unknown;
	includes?: unknown[];
	type?: string;
};

type FilterBuilderApi = {
	exec: (action: string, payload?: unknown) => void;
};

export const DASHBOARD_CHANNELS_GRID_FILTER_BUILDER_FIELDS = [
	{ id: 'platformLabel', label: 'Social platform', type: 'text' },
	{ id: 'channelName', label: 'Connected account', type: 'text' },
	{ id: 'groupName', label: 'Group name', type: 'text' },
	{ id: 'statusDisplay', label: 'Status', type: 'text' }
] as const;

function collectUsedFilterFields(node: DashboardChannelsFilterNode, out: Set<string>): void {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node.rules)) {
		for (const r of node.rules) collectUsedFilterFields(r, out);
		return;
	}
	const f = String(node.field ?? '').trim();
	if (f) out.add(f);
}

function normalizeFilterBuilderValueForDashboardChannels(
	v: DashboardChannelsFilterNode
): DashboardChannelsFilterNode {
	const walk = (node: DashboardChannelsFilterNode): DashboardChannelsFilterNode => {
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

export class DashboardChannelsGridFilterBuilderPresenter {
	value = $state<{ glue: 'and' | 'or'; rules: unknown[] }>({ glue: 'or', rules: [] });
	private _api = $state<FilterBuilderApi | undefined>(undefined);
	addFilterMenuOpen = $state(false);
	readonly fields = DASHBOARD_CHANNELS_GRID_FILTER_BUILDER_FIELDS;

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
		const normalized = normalizeFilterBuilderValueForDashboardChannels(
			ev.value as unknown as DashboardChannelsFilterNode
		);
		this.value = normalized as typeof this.value;
	}

	get addableFieldOptions(): { id: string; label: string }[] {
		const used = new Set<string>();
		collectUsedFilterFields(this.value as unknown as DashboardChannelsFilterNode, used);
		return DASHBOARD_CHANNELS_GRID_FILTER_BUILDER_FIELDS.filter((f) => !used.has(f.id)).map((f) => ({
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

	buildOptions(rows: readonly DashboardChannelTableRowViewModel[]): Record<string, string[]> {
		const platformLabel = [
			...new Set(rows.map((r) => String(r.platformLabel ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const channelName = [
			...new Set(rows.map((r) => String(r.channelName ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));
		const groupName = [
			...new Set(rows.map((r) => String(r.groupName ?? '').trim()).filter(Boolean))
		].sort((a, b) => {
			if (a === DASHBOARD_CHANNEL_UNGROUPED_GROUP_LABEL) return 1;
			if (b === DASHBOARD_CHANNEL_UNGROUPED_GROUP_LABEL) return -1;
			return a.localeCompare(b);
		});
		const statusDisplay = [
			...new Set(rows.map((r) => String(r.statusDisplay ?? '').trim()).filter(Boolean))
		].sort((a, b) => a.localeCompare(b));

		return { platformLabel, channelName, groupName, statusDisplay };
	}
}
