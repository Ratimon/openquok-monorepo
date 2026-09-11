<script lang="ts">
	import type { GuestComposerLockAction } from '$lib/posts/constants/guestComposerLock';
	import type { PostTagViewModel, RepeatIntervalKey } from '$lib/posts';

	import { icons } from '$data/icons';

	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import DatePicker from '$lib/ui/components/posts/DatePicker.svelte';
	import RepeatComponent from '$lib/ui/components/posts/RepeatComponent.svelte';
	import TagsComponent from '$lib/ui/components/posts/TagsComponent.svelte';
	import ComposerGuestLockBadge from '$lib/ui/components/posts/ComposerGuestLockBadge.svelte';
	import SignInToComposerActionModal from '$lib/ui/components/posts/SignInToComposerActionModal.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';
	import { cn } from '$lib/ui/helpers/common';

	type RepeatOption = { value: RepeatIntervalKey; label: string };

	type FooterVariant = 'schedulePost' | 'contentSet';

	type Props = {
		tagsVm: PostTagViewModel[];
		selectedTagNames: string[];
		repeatInterval: RepeatIntervalKey | null;
		repeatOptions: RepeatOption[];
		scheduledLocal?: string;
		busy?: boolean;
		showDelete?: boolean;
		primaryLabel: string;
		scheduleDisabled?: boolean;
		onToggleTag: (name: string) => void;
		onAddTag: (name?: string, color?: string) => void | Promise<void>;
		onDeleteTag?: (tag: PostTagViewModel) => void | Promise<void>;
		onRepeatChange: (value: RepeatIntervalKey | null) => void;
		onDeletePost?: () => void | Promise<void>;
		onSaveDraft: () => void | Promise<void>;
		saveDraftLabel?: string;
		onSchedule: () => void | Promise<void>;
		onPublishNow?: () => void | Promise<void>;
		showPublishNow?: boolean;
		footerVariant?: FooterVariant;
		onSaveContentSet?: () => void | Promise<void>;
		/**
		 * Public tool composer: tags / repeat / draft / schedule open Sign in + Sign up.
		 * The date picker stays usable for preview.
		 */
		guestMode?: boolean;
		isLoggedIn?: boolean;
	};

	let {
		tagsVm,
		selectedTagNames,
		repeatInterval,
		repeatOptions,
		scheduledLocal = $bindable(''),
		busy = false,
		showDelete = false,
		primaryLabel,
		scheduleDisabled = false,
		onToggleTag,
		onAddTag,
		onDeleteTag,
		onRepeatChange,
		onDeletePost,
		onSaveDraft,
		saveDraftLabel = 'Save as draft',
		onSchedule,
		onPublishNow = undefined,
		showPublishNow = true,
		footerVariant = 'schedulePost',
		onSaveContentSet = undefined,
		guestMode = false,
		isLoggedIn = false
	}: Props = $props();

	let guestLockOpen = $state(false);
	let guestLockAction = $state<GuestComposerLockAction>('draft');
	let publishNowMenuOpen = $state(false);

	const scheduleActionsDisabled = $derived(busy || scheduleDisabled);

	function openGuestLock(action: GuestComposerLockAction) {
		guestLockAction = action;
		guestLockOpen = true;
	}
</script>

<div
	class="border-base-300 bg-base-100/95 flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6"
>
	<div class="flex min-w-0 flex-wrap items-center gap-2">
		<div class="relative">
			<div class={guestMode ? 'pointer-events-none' : ''}>
				<TagsComponent
					{tagsVm}
					{selectedTagNames}
					busy={busy || guestMode}
					onToggleTag={onToggleTag}
					onAddTag={onAddTag}
					onDeleteTag={onDeleteTag}
				/>
			</div>
			{#if guestMode}
				<button
					type="button"
					class="absolute inset-0 z-10 rounded-lg"
					aria-label="Sign in to tag this post"
					onclick={() => openGuestLock('tags')}
				>
					<ComposerGuestLockBadge />
				</button>
			{/if}
		</div>
		<div class="relative">
			<div class={guestMode ? 'pointer-events-none' : ''}>
				<RepeatComponent
					{repeatInterval}
					{repeatOptions}
					disabled={busy || guestMode}
					onChange={onRepeatChange}
				/>
			</div>
			{#if guestMode}
				<button
					type="button"
					class="absolute inset-0 z-10 rounded-md"
					aria-label="Sign in to set a repeat schedule"
					onclick={() => openGuestLock('repeat')}
				>
					<ComposerGuestLockBadge />
				</button>
			{/if}
		</div>
	</div>

	<div class="flex flex-wrap items-center justify-end gap-2">
		{#if footerVariant === 'schedulePost'}
			{#if showDelete && !guestMode}
				<Button
					type="button"
					variant="ghost"
					class="gap-1.5 text-error hover:bg-error/10"
					disabled={busy}
					onclick={() => void onDeletePost?.()}
				>
					<AbstractIcon name={icons.Trash.name} class="size-4" width="16" height="16" />
					Delete Post
				</Button>
			{/if}
			<DatePicker bind:value={scheduledLocal} disabled={busy} />
			<Button
				type="button"
				variant="secondary"
				class={guestMode ? 'gap-1.5' : ''}
				disabled={busy}
				onclick={() => {
					if (guestMode) {
						openGuestLock('draft');
						return;
					}
					void onSaveDraft();
				}}
			>
				{#if guestMode}
					<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" />
				{/if}
				{saveDraftLabel}
			</Button>
			{#if showPublishNow && onPublishNow && !guestMode}
				<DropdownMenu.Root bind:open={publishNowMenuOpen}>
					<div
						class="border-primary/25 bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-primary-content hover:border-primary/35 inline-flex shrink-0 items-stretch overflow-hidden rounded-lg border text-sm shadow-sm transition-colors"
						class:pointer-events-none={scheduleActionsDisabled}
						class:opacity-50={scheduleActionsDisabled}
						role="group"
						aria-label="Schedule post"
					>
						<button
							type="button"
							class="hover:bg-primary-content/10 inline-flex h-10 items-center px-4 font-medium transition-colors"
							disabled={scheduleActionsDisabled}
							onclick={() => void onSchedule()}
						>
							{primaryLabel}
						</button>
						<div class="bg-primary-content/25 w-px shrink-0 self-stretch" aria-hidden="true"></div>
						<DropdownMenu.Trigger
							class={cn(
								'text-primary-content hover:bg-primary-content/10 inline-flex h-10 items-center justify-center px-2.5 transition-colors',
								'outline-none focus-visible:ring-2 focus-visible:ring-primary-content focus-visible:ring-offset-2 focus-visible:ring-offset-base-100'
							)}
							aria-label="More schedule options"
							disabled={scheduleActionsDisabled}
						>
							<AbstractIcon
								name={publishNowMenuOpen ? icons.ChevronUp.name : icons.MoreHorizontal.name}
								class="size-4"
								width="16"
								height="16"
							/>
						</DropdownMenu.Trigger>
					</div>
					<DropdownMenu.Content
						class="min-w-[11rem] border-0 bg-transparent p-0 shadow-none"
						align="end"
						side="top"
						sideOffset={6}
						collisionPadding={12}
					>
						<DropdownMenu.Item
							class={cn(
								'cursor-pointer justify-center rounded-lg border border-primary/25 px-4 py-2 font-medium shadow-sm',
								'bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-primary-content',
								'hover:from-primary/90 hover:via-primary/70 hover:to-primary/70',
								'data-[highlighted]:from-primary/90 data-[highlighted]:via-primary/70 data-[highlighted]:to-primary/70 data-[highlighted]:text-primary-content'
							)}
							disabled={scheduleActionsDisabled}
							onSelect={() => void onPublishNow()}
						>
							Publish now
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<Button
					type="button"
					variant="primary"
					class={guestMode ? 'gap-1.5' : ''}
					disabled={busy || (!guestMode && scheduleDisabled)}
					onclick={() => {
						if (guestMode) {
							openGuestLock('schedule');
							return;
						}
						void onSchedule();
					}}
				>
					{#if guestMode}
						<AbstractIcon name={icons.Lock.name} class="size-4" width="16" height="16" />
					{/if}
					{primaryLabel}
				</Button>
			{/if}
		{:else}
			<Button
				type="button"
				variant="primary"
				disabled={busy || scheduleDisabled}
				onclick={() => void onSaveContentSet?.()}
			>
				Save Template…
			</Button>
		{/if}
	</div>
</div>

{#if guestMode}
	<SignInToComposerActionModal
		bind:open={guestLockOpen}
		action={guestLockAction}
		{isLoggedIn}
	/>
{/if}
