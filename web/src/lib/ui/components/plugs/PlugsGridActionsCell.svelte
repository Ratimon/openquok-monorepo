<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import { getContext } from 'svelte';
	import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';
	import { plugsGridActionsKey, type PlugsGridActions } from '$lib/ui/components/plugs/plugsGridContext';
	import Button from '$lib/ui/buttons/Button.svelte';

	let { row }: ICellProps = $props();

	const actions = getContext<PlugsGridActions>(plugsGridActionsKey);

	const rowVm = $derived(row as unknown as PlugRuleTableRowViewModel);
</script>

<div class="flex flex-wrap items-center gap-1">
	<Button
		type="button"
		variant="secondary"
		size="sm"
		class="h-8 px-2 text-xs"
		onclick={() => actions?.openEdit(rowVm)}
	>
		Edit
	</Button>
	<Button
		type="button"
		variant="red"
		size="sm"
		class="h-8 px-2 text-xs"
		onclick={() => void actions?.remove(rowVm)}
	>
		Delete
	</Button>
</div>
