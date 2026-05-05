<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { SetGridTableRowViewModel } from '$lib/sets/SetGridTable.presenter.svelte';
	import { getContext } from 'svelte';
	import { setsGridActionsKey, type SetsGridActions } from '$lib/ui/components/sets/setsGridContext';
	import Button from '$lib/ui/buttons/Button.svelte';

	let { row }: ICellProps = $props();

	const actions = getContext<SetsGridActions>(setsGridActionsKey);

	function rowVm(): SetGridTableRowViewModel {
		return row as unknown as SetGridTableRowViewModel;
	}
</script>

<div class="flex flex-wrap items-center gap-1">
	<Button type="button" variant="outline" size="sm" class="h-8 px-2 text-xs" onclick={() => actions?.openEdit(rowVm())}>
		Edit
	</Button>
	<Button type="button" variant="red" size="sm" class="h-8 px-2 text-xs" onclick={() => void actions?.remove(rowVm())}>
		Delete
	</Button>
</div>
