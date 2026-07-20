<script lang="ts">
	import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/publicChannelConfig';

	import { page } from '$app/state';
	import { icons } from '$data/icons';
	import { listPublicChannelsForHub } from '$lib/content/constants/publicChannelConfig';
	import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';
	import { isParentRoute, route } from '$lib/utils/path';

	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import PublicNavCollapsibleSection from '$lib/ui/nav-bars/PublicNavCollapsibleSection.svelte';
	import PublicSoonBadge from '$lib/ui/components/PublicSoonBadge.svelte';

	type Props = {
		title: string;
		channelsPath: string;
		tabClass?: string;
		whenSelected?: string;
		whenUnselected?: string;
		inline?: boolean;
		onAfterNavigate?: () => void;
	};

	let {
		title,
		channelsPath,
		tabClass = '',
		whenSelected = '',
		whenUnselected = '',
		inline = false,
		onAfterNavigate
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

	function channelHref(channel: PublicChannelLandingPageViewModel): string {
		return route(getRootPathPublicChannel(channel.slug));
	}

	function handleNavigate() {
		onAfterNavigate?.();
	}
</script>

{#snippet channelsNavContent()}
	<div class="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3" aria-label="Social channels">
		{#each columns as column (column.map((channel) => channel.slug).join('-'))}
			<div class="flex min-w-0 flex-col gap-0.5">
				{#each column as channel (channel.slug)}
					{@const href = channelHref(channel)}
					<a
						href={href}
						onclick={handleNavigate}
						class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors hover:bg-base-100/80 hover:text-primary {channel.available
							? 'text-base-content'
							: 'text-base-content/60'}"
					>
						<span class="flex min-w-0 items-center gap-2.5">
							<span
								class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
								aria-hidden="true"
							>
								<AbstractIcon
									name={channel.icon}
									width="16"
									height="16"
									class="size-4 {channel.available ? '' : 'opacity-60'}"
									focusable="false"
								/>
							</span>
							<span class="truncate">{channel.platformLabel}</span>
						</span>
						{#if !channel.available}
							<PublicSoonBadge />
						{/if}
					</a>
				{/each}
			</div>
		{/each}
	</div>
	<div class="mt-2 border-t border-base-content/10 pt-2">
		<a
			href={channelsPath}
			onclick={handleNavigate}
			class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-base-content transition-colors hover:bg-base-100/80 hover:text-primary"
		>
			<span
				class="grid size-7 shrink-0 place-items-center rounded-md border border-white/10 bg-base-100/80"
				aria-hidden="true"
			>
				<AbstractIcon
					name={icons.Grid3x3.name}
					width="16"
					height="16"
					class="size-4"
					focusable="false"
				/>
			</span>
			<span class="truncate">See All</span>
		</a>
	</div>
{/snippet}

{#if inline}
	<PublicNavCollapsibleSection
		{title}
		{tabClass}
		{whenSelected}
		{whenUnselected}
		{isActive}
	>
		{@render channelsNavContent()}
	</PublicNavCollapsibleSection>
{:else}
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
			{@render channelsNavContent()}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
