<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { PlugRuleTableRowViewModel } from '$lib/plugs/GetPlug.presenter.svelte';
	import type { PlugsGridActions } from '$lib/ui/components/plugs/plugsGridContext';

	import { getContext } from 'svelte';
	import { plugsGridActionsKey } from '$lib/ui/components/plugs/plugsGridContext';
	import Switch from '$lib/ui/switch/switch.svelte';

	let { row }: ICellProps = $props();

	const actions = getContext<PlugsGridActions>(plugsGridActionsKey);

	const rowVm = $derived(row as unknown as PlugRuleTableRowViewModel);
</script>

<label class="flex cursor-pointer items-center gap-2">
	<span class="sr-only">
		Active
	</span>
	<Switch
		checked={rowVm.activated === true}
		onchange={(e) => void actions?.toggleActive(rowVm, e.currentTarget.checked)}
	/>
</label>
