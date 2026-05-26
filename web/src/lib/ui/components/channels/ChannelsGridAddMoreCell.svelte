<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import { getContext } from 'svelte';

	import type { HomeChannelTableRowViewModel } from '$lib/channels/HomeChannelsGridTable.presenter.svelte';

	import ChannelAddMoreButton from '$lib/ui/components/channels/ChannelAddMoreButton.svelte';
	import {
		channelsGridActionsKey,
		channelsGridLimitKey,
		type ChannelsGridActions,
		type ChannelsGridLimitContext
	} from '$lib/ui/components/channels/channelsGridContext';

	let { row }: ICellProps = $props();

	const actions = getContext<ChannelsGridActions>(channelsGridActionsKey);
	const limitCtx = getContext<ChannelsGridLimitContext | undefined>(channelsGridLimitKey);

	const rowVm = $derived(row as unknown as HomeChannelTableRowViewModel);
	const platformKey = $derived(rowVm.platformKey);
	const channelLimitFull = $derived(limitCtx?.isChannelLimitFull() ?? false);
</script>

<ChannelAddMoreButton
	{platformKey}
	{channelLimitFull}
	onClick={() => actions?.addMoreChannel(platformKey)}
/>
