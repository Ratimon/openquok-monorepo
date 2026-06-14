<script lang="ts">
	import type { PublicChannelLandingPage } from '$lib/content/constants/publicChannelConfig';

	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { listPublicChannelsForHub } from '$lib/content/constants/publicChannelConfig';
	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { isParentRoute, route } from '$lib/utils/path';

	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		title: string;
		channelsPath: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
	};

	let {
		title,
		channelsPath,
		tabClass = '',
		whenSelected = '',
		whenUnselected = ''
	}: Props = $props();

	const channels = listPublicChannelsForHub();
	const columns = splitIntoColumns(channels, 3);

	let isActive = $derived(isParentRoute(page.url.pathname, channelsPath));

	function splitIntoColumns<T>(items: readonly T[], columnCount: number): T[][] {
		if (columnCount <= 0 || items.length === 0) return [];
		const size = Math.ceil(items.length / columnCount);
		return Array.from({ length: columnCount }, (_, index) =>
			items.slice(index * size, (index + 1) * size)
		).filter((column) => column.length > 0);
	}

	function channelHref(channel: PublicChannelLandingPage): string | undefined {
		if (!channel.available) return undefined;
		return route(getRootPathPublicChannel(channel.slug));
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		type="button"
		class="{tabClass} inline-flex cursor-pointer items-center gap-1 border-none bg-transparent {isActive
			? whenSelected
			: whenUnselected}"
	>
		{title}
		<span aria-hidden="true">
			<AbstractIcon
				name={icons.ChevronDown.name}
				width="16"
				height="16"
				class="size-4 shrink-0 opacity-70"
				focusable="false"
			/>
		</span>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content
		align="center"
		sideOffset={10}
		class="w-[min(calc(100vw-2rem),42rem)] rounded-xl border border-base-content/10 bg-base-200 p-4 shadow-xl"
	>
		<div class="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3" aria-label="Social channels">
			{#each columns as column (column.map((channel) => channel.slug).join('-'))}
				<div class="flex min-w-0 flex-col gap-0.5">
					{#each column as channel (channel.slug)}
						{@const href = channelHref(channel)}
						{#if href}
							<a
								href={href}
								class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
							>
								<span
									class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
									aria-hidden="true"
								>
									<AbstractIcon
										name={channel.icon}
										width="16"
										height="16"
										class="size-4"
										focusable="false"
									/>
								</span>
								<span class="truncate">{channel.platformLabel}</span>
							</a>
						{:else}
							<span
								class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content/45"
								title="Coming soon"
							>
								<span
									class="grid size-7 shrink-0 place-items-center rounded-md border border-white/5 bg-base-100/40"
									aria-hidden="true"
								>
									<AbstractIcon
										name={channel.icon}
										width="16"
										height="16"
										class="size-4 opacity-60"
										focusable="false"
									/>
								</span>
								<span class="truncate">{channel.platformLabel}</span>
							</span>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
