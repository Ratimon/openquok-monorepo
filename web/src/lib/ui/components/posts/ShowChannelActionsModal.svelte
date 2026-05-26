<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

	import { getContext } from 'svelte';

	import { copyToClipboard } from '$lib/utils/clipboard';
	import { cn } from '$lib/ui/helpers/common';
	import { postsLimitKey, type PostsLimitContext } from '$lib/ui/components/posts/postsLimitContext';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icons';
	import { socialProviderIcon } from '$data/social-providers';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import * as Dialog from '$lib/ui/dialog';
	import { Separator } from '$lib/ui/separator';
	import DeleteChannelModal from '$lib/ui/components/posts/DeleteChannelModal.svelte';
	import IntegrationChannelPicture from '$lib/ui/components/posts/IntegrationChannelPicture.svelte';

	export type Props = {
		open: boolean;
		integration: CreateSocialPostChannelViewModel | null;
		workspaceId: string | null;
		busy?: boolean;
		continueSetupHref: (integration: CreateSocialPostChannelViewModel) => string;
		onClose: () => void;
		onCreatePost?: (integration: CreateSocialPostChannelViewModel) => void;
		onMoveToGroup: (integration: CreateSocialPostChannelViewModel) => void;
		onEditTimeSlots: (integration: CreateSocialPostChannelViewModel) => void;
		onSetDisabled: (integrationId: string, disabled: boolean) => Promise<boolean>;
		onRemove: (integrationId: string) => Promise<boolean>;
	};

	let {
		open,
		integration,
		workspaceId,
		busy = false,
		continueSetupHref,
		onClose,
		onCreatePost,
		onMoveToGroup,
		onEditTimeSlots,
		onSetDisabled,
		onRemove
	}: Props = $props();

	let confirmRemoveOpen = $state(false);
	let actionBusy = $state(false);

	const postsLimitCtx = getContext<PostsLimitContext | undefined>(postsLimitKey);
	const isPostsLimitFull = $derived(postsLimitCtx?.isPostsLimitFull() ?? false);

	const effectiveBusy = $derived(busy || actionBusy);

	function handleCreatePost() {
		if (!integration || !onCreatePost) return;
		const run = () => {
			onClose();
			onCreatePost(integration);
		};
		if (postsLimitCtx) {
			postsLimitCtx.tryCreatePost(run);
			return;
		}
		run();
	}

	$effect(() => {
		if (!open) {
			confirmRemoveOpen = false;
			actionBusy = false;
		}
	});

	async function handleCopyChannelId() {
		if (!integration) return;
		const copied = await copyToClipboard(integration.id);
		if (copied) {
			toast.success('Channel ID copied to clipboard');
			onClose();
		} else {
			toast.error('Could not copy to clipboard.');
		}
	}

	async function handleToggleDisabled() {
		if (!integration) return;
		actionBusy = true;
		try {
			await onSetDisabled(integration.id, !integration.disabled);
			onClose();
		} finally {
			actionBusy = false;
		}
	}

	async function handleRemove() {
		if (!integration) return;
		actionBusy = true;
		try {
			const ok = await onRemove(integration.id);
			if (ok) {
				confirmRemoveOpen = false;
				onClose();
			}
		} finally {
			actionBusy = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(o) => (!o ? onClose() : null)}>
	<Dialog.Content class="max-w-sm p-0" showCloseButton={true}>
		{#if integration}
			<div class="border-b border-base-300 px-4 py-3">
				<div class="text-base font-semibold text-base-content">
					Channel actions
				</div>
				<div class="mt-2 flex items-center gap-3">
					<div class="relative h-10 w-10 shrink-0">
						<div class="h-full w-full overflow-hidden rounded-full ring-1 ring-base-300/80">
							<IntegrationChannelPicture
								profilePictureUrl={integration.picture}
								alt=""
								class="h-10 w-10 object-cover"
								fallbackIcon={socialProviderIcon(integration.identifier)}
							/>
						</div>
						<span
							class="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border border-base-300 bg-base-100 shadow-sm"
							aria-hidden="true"
						>
							<AbstractIcon
								name={socialProviderIcon(integration.identifier)}
								class="size-3.5"
								width="14"
								height="14"
							/>
						</span>
					</div>
					<div class="min-w-0 flex-1">
						<div class="truncate text-sm font-medium text-base-content">
							{integration.name}
						</div>
						<div class="truncate text-xs text-base-content/60">
							{integration.identifier}
						</div>
						{#if integration.group}
							<div class="mt-0.5 truncate text-xs text-base-content/55">
								Group: {integration.group.name}
							</div>
						{/if}
					</div>
				</div>
				<div class="mt-2 flex flex-wrap gap-1.5">
					{#if integration.disabled}
						<span class="badge badge-ghost badge-sm">Disabled</span>
					{/if}
					{#if integration.refreshNeeded}
						<span class="badge badge-warning badge-sm">Refresh needed</span>
					{/if}
					{#if integration.inBetweenSteps}
						<span class="badge badge-info badge-sm">Setup incomplete</span>
					{/if}
				</div>
			</div>

			<div class="p-2">
				{#if onCreatePost && integration.schedulable}
					<button
						type="button"
						class={cn(
							'flex w-full items-center gap-2 rounded px-3 py-2 text-sm font-medium text-start outline-none disabled:opacity-50',
							isPostsLimitFull
								? 'bg-warning/10 text-warning hover:bg-warning/15'
								: 'hover:bg-primary/15 text-primary'
						)}
						disabled={effectiveBusy}
						onclick={handleCreatePost}
					>
						<AbstractIcon
							name={isPostsLimitFull ? icons.Lock.name : icons.Megaphone.name}
							class="size-4 shrink-0"
							width="16"
							height="16"
						/>
						{isPostsLimitFull ? 'Post limit reached' : 'Create post'}
					</button>
				{/if}

				{#if integration.inBetweenSteps && workspaceId}
					<a
						href={continueSetupHref(integration)}
						class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none"
						onclick={() => onClose()}
					>
						<AbstractIcon name={icons.Settings.name} class="size-4 shrink-0" width="16" height="16" />
						Complete setup
					</a>
				{:else if integration.refreshNeeded && workspaceId}
					<a
						href={continueSetupHref(integration)}
						class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none"
						onclick={() => onClose()}
					>
						<AbstractIcon name={icons.RefreshCw.name} class="size-4 shrink-0" width="16" height="16" />
						Refresh connection
					</a>
				{/if}

				<button
					type="button"
					class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
					disabled={effectiveBusy}
					onclick={() => void handleCopyChannelId()}
				>
					<AbstractIcon name={icons.Copy.name} class="size-4 shrink-0" width="16" height="16" />
					Copy channel ID
				</button>

				<button
					type="button"
					class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
					disabled={effectiveBusy}
					onclick={() => {
						onClose();
						onMoveToGroup(integration);
					}}
				>
					<AbstractIcon name={icons.UserPlus.name} class="size-4 shrink-0" width="16" height="16" />
					Move / add to group
				</button>

				<button
					type="button"
					class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
					disabled={effectiveBusy}
					onclick={() => {
						onClose();
						onEditTimeSlots(integration);
					}}
				>
					<AbstractIcon name={icons.Timer.name} class="size-4 shrink-0" width="16" height="16" />
					Edit time slots
				</button>

				<button
					type="button"
					class="hover:bg-base-200/60 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start outline-none disabled:opacity-50"
					disabled={effectiveBusy}
					onclick={() => void handleToggleDisabled()}
				>
					<AbstractIcon
						name={integration.disabled ? icons.CircleCheck.name : icons.Ban.name}
						class="size-4 shrink-0"
						width="16"
						height="16"
					/>
					{integration.disabled ? 'Enable channel' : 'Disable channel'}
				</button>

				<Separator class="my-2" />

				<button
					type="button"
					class="hover:bg-error/10 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-start text-error outline-none disabled:opacity-50"
					disabled={effectiveBusy}
					onclick={() => (confirmRemoveOpen = true)}
				>
					<AbstractIcon name={icons.Trash.name} class="size-4 shrink-0" width="16" height="16" />
					Delete channel
				</button>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>

{#if integration}
	<DeleteChannelModal
		bind:open={confirmRemoveOpen}
		channelName={integration.name}
		busy={effectiveBusy}
		onCancel={() => (confirmRemoveOpen = false)}
		onConfirm={handleRemove}
	/>
{/if}
