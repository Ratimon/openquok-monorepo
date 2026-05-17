<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import type { DashboardChannelTableRowViewModel } from '$lib/channels/DashboardChannelsGridTable.presenter.svelte';

	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';

	let { row }: ICellProps = $props();

	const rowVm = $derived(row as unknown as DashboardChannelTableRowViewModel);
</script>

<div class="flex min-w-0 items-start gap-1.5 py-0.5">
	<div class="relative h-8 w-8 shrink-0">
		<div class="h-full w-full overflow-hidden rounded-full ring-1 ring-base-300/80">
			<IntegrationChannelPicture
				profilePictureUrl={rowVm.channelPicture}
				alt=""
				class="h-8 w-8 object-cover"
				fallbackIcon={socialProviderIcon(rowVm.platformKey)}
			/>
		</div>
		<span
			class="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full border border-base-300 bg-base-100 shadow-sm"
			aria-hidden="true"
		>
			<AbstractIcon
				name={socialProviderIcon(rowVm.platformKey)}
				class="size-3"
				width="12"
				height="12"
			/>
		</span>
	</div>
	<div class="min-w-0 flex-1 text-base-content">
		<div class="truncate text-sm font-medium">
			{rowVm.channelName || '—'}
		</div>
		<div class="truncate text-xs text-base-content/60">
			{rowVm.platformLabel || '—'}
		</div>
	</div>
</div>
