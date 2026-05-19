<script lang="ts">
	import type {
		CreateSocialPostChannelViewModel,
		DashboardChannelGroupViewModel,
		DashboardPlatformChannelRowViewModel
	} from '$lib/channels/GetChannel.presenter.svelte';

	import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import PlatformChannelRows from '$lib/ui/components/channels/PlatformChannelRows.svelte';

	type Props = {
		channelGroupSections: DashboardChannelGroupViewModel[];
		platformChannelRowsUngrouped: DashboardPlatformChannelRowViewModel[];
		groupDetailsOpen: Record<string, boolean>;
		ungroupedDetailsOpen: boolean;
		workspaceId: string;
		continueSetupHref: (integration: CreateSocialPostChannelViewModel) => string;
		onCreatePostForGroup: (groupId: string) => void;
		onCreatePost: (preselectIntegrationId: string | null) => void;
		onGoToCalendar: (groupId: string | null) => void;
		onCreatePostForChannel: (integrationId: string) => void;
		onMoveToGroup: (integration: CreateSocialPostChannelViewModel) => void;
		onEditTimeSlots: (integration: CreateSocialPostChannelViewModel) => void;
		onSetDisabled: (id: string, disabled: boolean) => Promise<boolean>;
		onRemove: (id: string) => Promise<boolean>;
		onAddAnotherChannel: (identifier: string) => void;
	};

	let {
		channelGroupSections,
		platformChannelRowsUngrouped,
		groupDetailsOpen = $bindable(),
		ungroupedDetailsOpen = $bindable(),
		workspaceId,
		continueSetupHref,
		onCreatePostForGroup,
		onCreatePost,
		onGoToCalendar,
		onCreatePostForChannel,
		onMoveToGroup,
		onEditTimeSlots,
		onSetDisabled,
		onRemove,
		onAddAnotherChannel
	}: Props = $props();
</script>

{#if channelGroupSections.length > 0}
	<div class="mt-4 space-y-2">
		<h4 class="text-sm font-semibold text-base-content/80">
			Grouped accounts/channels
		</h4>
		{#each channelGroupSections as group (group.id)}
			<details class="rounded-lg border border-base-300 bg-base-200/40" bind:open={groupDetailsOpen[group.id]}>
				<summary
					class="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 marker:hidden [&::-webkit-details-marker]:hidden"
				>
					<AbstractIcon
						name={icons.ChevronRight.name}
						class="size-4 shrink-0 text-base-content/70 transition-transform duration-200 {groupDetailsOpen[group.id]
							? 'rotate-90'
							: ''}"
						width="16"
						height="16"
					/>
					<span class="min-w-0 flex-1 truncate font-medium text-base-content">{group.name}</span>
					<Button
						type="button"
						size="sm"
						variant="secondary"
						class="shrink-0"
						onclick={(e: MouseEvent) => {
							e.preventDefault();
							e.stopPropagation();
							onCreatePostForGroup(group.id);
						}}
					>
						Create Post for {group.name}
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						class="shrink-0 gap-1.5"
						onclick={(e: MouseEvent) => {
							e.preventDefault();
							e.stopPropagation();
							onGoToCalendar(group.id);
						}}
					>
						<AbstractIcon
							name={icons.CalendarClock.name}
							class="h-4 w-4"
							width="16"
							height="16"
						/>
						Calendar
					</Button>
				</summary>
				<div class="border-t border-base-300 px-3 py-3">
					<PlatformChannelRows
						rows={group.platformRows}
						{workspaceId}
						{continueSetupHref}
						onCreatePost={onCreatePostForChannel}
						{onMoveToGroup}
						{onEditTimeSlots}
						{onSetDisabled}
						{onRemove}
						{onAddAnotherChannel}
					/>
				</div>
			</details>
		{/each}
	</div>
{/if}

{#if platformChannelRowsUngrouped.length > 0}
	<div class="mt-4 space-y-2">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h4 class="text-sm font-semibold text-base-content/80">
				Ungrouped accounts/channels
			</h4>
			<div class="flex flex-wrap items-center justify-end gap-2">
				<Button
					type="button"
					size="sm"
					variant="primary"
					class="shrink-0 gap-1.5"
					onclick={(e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						onCreatePost(null);
					}}
				>
					<AbstractIcon name={icons.Plus.name} class="h-4 w-4" width="16" height="16" />
					Create Post
				</Button>
				<Button
					type="button"
					size="sm"
					variant="outline"
					class="shrink-0 gap-1.5"
					onclick={(e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						onGoToCalendar(CALENDAR_UNGROUPED_SENTINEL);
					}}
				>
					<AbstractIcon
						name={icons.CalendarClock.name}
						class="h-4 w-4"
						width="16"
						height="16"
					/>
					Calendar
				</Button>
			</div>
		</div>
		<p class="text-sm text-base-content/70">
			To add a channel to a group, open its menu and select <span class="font-medium text-base-content">Move / add to group</span>.
		</p>
		{#if channelGroupSections.length === 0}
			<details class="rounded-lg border border-base-300 bg-base-200/40" bind:open={ungroupedDetailsOpen}>
				<summary
					class="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 marker:hidden [&::-webkit-details-marker]:hidden"
				>
					<AbstractIcon
						name={icons.ChevronRight.name}
						class="size-4 shrink-0 text-base-content/70 transition-transform duration-200 {ungroupedDetailsOpen
							? 'rotate-90'
							: ''}"
						width="16"
						height="16"
					/>
					<span class="font-medium text-base-content">Channels</span>
				</summary>
				<div class="border-t border-base-300 px-3 py-3">
					<PlatformChannelRows
						rows={platformChannelRowsUngrouped}
						{workspaceId}
						{continueSetupHref}
						onCreatePost={onCreatePostForChannel}
						{onMoveToGroup}
						{onEditTimeSlots}
						{onSetDisabled}
						{onRemove}
						{onAddAnotherChannel}
					/>
				</div>
			</details>
		{:else}
			<div class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-3">
				<PlatformChannelRows
					rows={platformChannelRowsUngrouped}
					{workspaceId}
					{continueSetupHref}
					onCreatePost={onCreatePostForChannel}
					{onMoveToGroup}
					{onEditTimeSlots}
					{onSetDisabled}
					{onRemove}
					{onAddAnotherChannel}
				/>
			</div>
		{/if}
	</div>
{/if}
