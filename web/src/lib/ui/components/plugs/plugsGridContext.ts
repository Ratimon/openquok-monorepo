import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';

export const plugsGridActionsKey = Symbol('plugsGridActions');

export type PlugsGridActions = {
	toggleActive: (vm: PlugRuleTableRowViewModel, on: boolean) => void | Promise<void>;
	openEdit: (vm: PlugRuleTableRowViewModel) => void;
	remove: (vm: PlugRuleTableRowViewModel) => void | Promise<void>;
};
