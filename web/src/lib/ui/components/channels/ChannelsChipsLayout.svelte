<script lang="ts">
	import type {
		CreateSocialPostChannelViewModel,
		HomeChannelGroupViewModel,
		HomeChannelRowViewModel
	} from '$lib/channels/GetChannel.presenter.svelte';

	import { getContext } from 'svelte';

	import { CALENDAR_UNGROUPED_SENTINEL } from '$lib/posts';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import { cn } from '$lib/ui/helpers/common';
	import { postsLimitKey, type PostsLimitContext } from '$lib/ui/components/posts/postsLimitContext';
	import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';

	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import ChannelRows from '$lib/ui/components/channels/ChannelRows.svelte';

	type Props = {
		channelGroupSectionsVm: HomeChannelGroupViewModel[];
		channelRowsUngroupedVm: HomeChannelRowViewModel[];
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
		channelLimitFull?: boolean;
		productProfilesByGroupId?: Map<string, AutoLaunchProductProfileDto[]>;
	};

	let {
		channelGroupSectionsVm,
		channelRowsUngroupedVm,
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
		onAddAnotherChannel,
		channelLimitFull = false,
		productProfilesByGroupId = new Map()
	}: Props = $props();

	const postsLimitCtx = getContext<PostsLimitContext | undefined>(postsLimitKey);
	const isPostsLimitFull = $derived(postsLimitCtx?.isPostsLimitFull() ?? false);

	const createPostButtonClass = $derived(
		cn(
			'shrink-0 gap-1.5',
			isPostsLimitFull &&
				'border-warning/35 bg-warning/5 text-warning hover:border-warning/50 hover:bg-warning/10'
		)
	);
</script>

{#if channelGroupSectionsVm.length > 0}
	<div class="mt-4 space-y-2">
		<h4 class="text-sm font-semibold text-base-content/80">Business profiles</h4>
		{#each channelGroupSectionsVm as group (group.id)}
			<details class="rounded-lg border border-base-300 bg-base-200/40"
				bind:open={groupDetailsOpen[group.id]}
			>
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
						variant={isPostsLimitFull ? 'outline' : 'secondary'}
						class={createPostButtonClass}
						onclick={(e: MouseEvent) => {
							e.preventDefault();
							e.stopPropagation();
							onCreatePostForGroup(group.id);
						}}
					>
						{#if isPostsLimitFull}
							<AbstractIcon name={icons.Lock.name} class="h-4 w-4" width="16" height="16" />
						{/if}
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
					<ChannelRows
						rows={group.channelRows}
						{workspaceId}
						{channelLimitFull}
						{continueSetupHref}
						onCreatePost={onCreatePostForChannel}
						{onMoveToGroup}
						{onEditTimeSlots}
						{onSetDisabled}
						{onRemove}
						{onAddAnotherChannel}
					/>
					{#if (productProfilesByGroupId.get(group.id) ?? []).length > 0}
						<div class="mt-4 border-t border-base-300 pt-3">
							<p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
								Directory launches
							</p>
							<ul class="mt-2 space-y-2">
								{#each productProfilesByGroupId.get(group.id) ?? [] as profile (profile.id)}
									<li
										class="flex flex-wrap items-center justify-between gap-2 rounded-md border border-base-300/80 bg-base-100 px-2 py-2"
									>
										<span class="text-sm font-medium text-base-content">{profile.name}</span>
										<AddDirectoryLaunch
											buttonLabel="Launch"
											buttonVariant="outline"
											buttonClass="btn-xs"
											productProfileId={profile.id}
										/>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</details>
		{/each}
	</div>
{/if}

{#if channelRowsUngroupedVm.length > 0}
	<div class="mt-4 space-y-2">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h4 class="text-sm font-semibold text-base-content/80">
				Not linked to a business profile
			</h4>
			<div class="flex flex-wrap items-center justify-end gap-2">
				<Button
					type="button"
					size="sm"
					variant={isPostsLimitFull ? 'outline' : 'primary'}
					class={createPostButtonClass}
					onclick={(e: MouseEvent) => {
						e.preventDefault();
						e.stopPropagation();
						onCreatePost(null);
					}}
				>
					<AbstractIcon
						name={isPostsLimitFull ? icons.Lock.name : icons.Plus.name}
						class="h-4 w-4"
						width="16"
						height="16"
					/>
					{isPostsLimitFull ? 'Post limit reached' : 'Create Post'}
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
			Open a channel menu and choose
			<span class="font-medium text-base-content">Move / add to business profile</span>, or use
			<span class="font-medium text-base-content">Add Channel</span> → Uneed for directory-only launches.
			Create a profile on the <span class="font-medium text-base-content">Products</span> tab first if needed.
		</p>
		{#if channelGroupSectionsVm.length === 0}
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
					<ChannelRows
						rows={channelRowsUngroupedVm}
						{workspaceId}
						{channelLimitFull}
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
				<ChannelRows
					rows={channelRowsUngroupedVm}
					{workspaceId}
					{channelLimitFull}
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
