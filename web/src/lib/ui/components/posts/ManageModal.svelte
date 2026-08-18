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
		footerVariant?: FooterVariant;
		onSaveContentSet?: () => void | Promise<void>;
		/**
		 * Public tool composer: tags / repeat / draft / schedule open Sign in + Sign up.
		 * The date picker stays usable for preview.
		 */
		guestMode?: boolean;
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
		footerVariant = 'schedulePost',
		onSaveContentSet = undefined,
		guestMode = false
	}: Props = $props();

	let guestLockOpen = $state(false);
	let guestLockAction = $state<GuestComposerLockAction>('draft');

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
	<SignInToComposerActionModal bind:open={guestLockOpen} action={guestLockAction} />
{/if}
