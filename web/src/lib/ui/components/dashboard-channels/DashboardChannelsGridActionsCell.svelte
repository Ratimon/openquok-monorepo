<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import { getContext } from 'svelte';

	import type { DashboardChannelTableRowViewModel } from '$lib/channels/DashboardChannelsGridTable.presenter.svelte';

	import {
		dashboardChannelsGridActionsKey,
		type DashboardChannelsGridActions
	} from '$lib/ui/components/dashboard-channels/dashboardChannelsGridContext';
	import Button from '$lib/ui/buttons/Button.svelte';

	let { row }: ICellProps = $props();

	const actions = getContext<DashboardChannelsGridActions>(dashboardChannelsGridActionsKey);

	const rowVm = $derived(row as unknown as DashboardChannelTableRowViewModel);
</script>

<Button
	type="button"
	variant="primary"
	size="sm"
	class="h-8 px-2.5 text-xs"
	onclick={() => actions?.openActions(rowVm.channel)}
>
	Actions
</Button>
