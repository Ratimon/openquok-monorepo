<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import { getContext } from 'svelte';

	import type { DashboardChannelTableRowViewModel } from '$lib/area-protected/DashboardChannelsGridTable.presenter.svelte';

	import { icons } from '$data/icons';
	import { socialProviderDisplayLabel, socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import {
		dashboardChannelsGridActionsKey,
		type DashboardChannelsGridActions
	} from '$lib/ui/components/dashboard-channels/dashboardChannelsGridContext';

	let { row }: ICellProps = $props();

	const actions = getContext<DashboardChannelsGridActions>(dashboardChannelsGridActionsKey);

	const rowVm = $derived(row as unknown as DashboardChannelTableRowViewModel);
	const platformKey = $derived(rowVm.platformKey);
	const platformLabel = $derived(socialProviderDisplayLabel(platformKey));
</script>

<Button
	type="button"
	variant="ghost"
	size="sm"
	class="h-8 shrink-0 gap-1.5 border-base-300 px-2 text-xs whitespace-nowrap"
	aria-label={`Add another ${platformLabel} connection`}
	onclick={() => actions?.addMoreChannel(platformKey)}
>
	<span class="inline-flex items-center gap-1.5" aria-hidden="true">
		<AbstractIcon name={icons.Plus.name} class="size-3.5" width="14" height="14" />
		Add more
		<AbstractIcon name={socialProviderIcon(platformKey)} class="size-3.5" width="14" height="14" />
	</span>
</Button>
