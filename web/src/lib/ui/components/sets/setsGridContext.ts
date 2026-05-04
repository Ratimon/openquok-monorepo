import type { SetGridTableRowViewModel } from '$lib/sets/SetGrid.presenter.svelte';

export const setsGridActionsKey = Symbol('setsGridActions');

export type SetsGridActions = {
	openEdit: (vm: SetGridTableRowViewModel) => void;
	remove: (vm: SetGridTableRowViewModel) => void | Promise<void>;
};
