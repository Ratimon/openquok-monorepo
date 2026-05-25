<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import { getContext } from 'svelte';

	import type { HomeChannelTableRowViewModel } from '$lib/channels/HomeChannelsGridTable.presenter.svelte';

	import {
		channelsGridActionsKey,
		type ChannelsGridActions
	} from '$lib/ui/components/channels/channelsGridContext';
	import Button from '$lib/ui/buttons/Button.svelte';

	let { row }: ICellProps = $props();

	const actions = getContext<ChannelsGridActions>(channelsGridActionsKey);

	const rowVm = $derived(row as unknown as HomeChannelTableRowViewModel);
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
