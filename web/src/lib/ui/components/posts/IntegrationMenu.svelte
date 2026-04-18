<script lang="ts">
	import type { IconName } from '$data/icon';
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import copy from 'copy-to-clipboard';
	import { toast } from '$lib/ui/sonner';
	import { icons } from '$data/icon';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Collapsible from '$lib/ui/collapsible';
	import * as Dialog from '$lib/ui/dialog';
	import * as Popover from '$lib/ui/popover';
	import { ImageWithFallback } from '$lib/ui/images';

	type Props = {
		integration: CreateSocialPostChannelViewModel;
		workspaceId: string;
		providerIcon: (identifier: string) => IconName;
		continueSetupHref: (integration: CreateSocialPostChannelViewModel) => string;
		/** Opens the workspace create-post flow with this channel pre-selected. */
		onCreatePost?: (integration: CreateSocialPostChannelViewModel) => void;
		onMoveToGroup: (integration: CreateSocialPostChannelViewModel) => void;
		onEditTimeSlots: (integration: CreateSocialPostChannelViewModel) => void;
		onSetDisabled: (integrationId: string, disabled: boolean) => Promise<boolean>;
		onRemove: (integrationId: string) => Promise<boolean>;
		/** `chip`: compact pill for horizontal rows (e.g. account dashboard). */
		variant?: 'card' | 'chip';
	};

	let {
		integration,
		workspaceId,
		providerIcon,
		continueSetupHref,
		onCreatePost,
		onMoveToGroup,
		onEditTimeSlots,
		onSetDisabled,
		onRemove,
		variant = 'card'
	}: Props = $props();

	let menuOpen = $state(false);
	let confirmRemoveOpen = $state(false);
	let busy = $state(false);

	function handleCopyChannelId() {
		menuOpen = false;
		const copied = copy(integration.id);
		if (copied) {
			toast.success('Channel ID copied to clipboard');
		} else {
			toast.error('Could not copy to clipboard.');
		}
	}

	async function handleToggleDisabled() {
		busy = true;
		try {
			await onSetDisabled(integration.id, !integration.disabled);
		} finally {
			busy = false;
		}
	}

	async function handleRemove() {
		busy = true;
		try {
			const ok = await onRemove(integration.id);
			if (ok) {
				confirmRemoveOpen = false;
				menuOpen = false;
			}
		} finally {
			busy = false;
		}
	}

</script>

{#snippet channelActionBody()}
	<div class="flex flex-col gap-2">
		<div class="flex flex-wrap gap-2">
			{#if integration.disabled}
				<span class="badge badge-ghost badge-sm">
					Disabled
				</span>
			{/if}
			{#if integration.refreshNeeded}
				<span class="badge badge-warning badge-sm">
					Refresh needed
				</span>
			{/if}
		</div>
		{#if onCreatePost && !integration.disabled && !integration.inBetweenSteps}
			<Button
				type="button"
				variant="primary"
				size="sm"
				class="w-full justify-start gap-2 sm:w-fit"
				disabled={busy}
				onclick={() => {
					menuOpen = false;
					onCreatePost(integration);
				}}
			>
				<AbstractIcon
					name={icons.Megaphone.name}
					class="size-4 shrink-0 text-primary-content"
					width="16"
					height="16"
				/>
				<span class="min-w-0 text-start text-xs leading-tight text-primary-content">
					Create Post
				</span>
			</Button>
		{/if}
		{#if integration.inBetweenSteps && workspaceId}
			<Button
				href={continueSetupHref(integration)}
				size="sm"
				class="w-full justify-start gap-2 sm:w-fit"
			>
				<AbstractIcon name={icons.Settings.name} class="size-4 shrink-0" width="16" height="16" />
				<span class="min-w-0 text-start text-xs leading-tight">
					Complete setup
				</span>
			</Button>
		{:else if integration.refreshNeeded && workspaceId}
			<Button
				href={continueSetupHref(integration)}
				variant="outline"
				size="sm"
				class="w-full justify-start gap-2 sm:w-fit"
			>
				<AbstractIcon name={icons.RefreshCw.name} class="size-4 shrink-0" width="16" height="16" />
				<span class="min-w-0 text-start text-xs leading-tight">
					Refresh connection
				</span>
			</Button>
		{/if}
		<Button
			type="button"
			variant="outline"
			size="sm"
			class="w-full justify-start gap-2 sm:w-fit"
			disabled={busy}
			onclick={handleCopyChannelId}
		>
			<AbstractIcon name={icons.Copy.name} class="size-4 shrink-0" width="16" height="16" />
			<span class="min-w-0 text-start text-xs leading-tight">
				Copy channel ID
			</span>
		</Button>
		<Button
			type="button"
			variant="outline"
			size="sm"
			class="w-full justify-start gap-2 sm:w-fit"
			disabled={busy}
			onclick={() => {
				menuOpen = false;
				onMoveToGroup(integration);
			}}
		>
			<AbstractIcon name={icons.UserPlus.name} class="size-4 shrink-0" width="16" height="16" />
			<span class="min-w-0 text-start text-xs leading-tight">
				Move / add to group
			</span>
		</Button>
		<Button
			type="button"
			variant="outline"
			size="sm"
			class="w-full justify-start gap-2 sm:w-fit"
			disabled={busy}
			onclick={() => {
				menuOpen = false;
				onEditTimeSlots(integration);
			}}
		>
			<AbstractIcon name={icons.Timer.name} class="size-4 shrink-0" width="16" height="16" />
			<span class="min-w-0 text-start text-xs leading-tight">
				Edit time slots
			</span>
		</Button>
		<Button
			type="button"
			variant="outline"
			size="sm"
			class="w-full justify-start gap-2 sm:w-fit"
			disabled={busy}
			onclick={handleToggleDisabled}
		>
			<AbstractIcon
				name={integration.disabled ? icons.CircleCheck.name : icons.Ban.name}
				class="size-4 shrink-0"
				width="16"
				height="16"
			/>
			<span class="min-w-0 text-start text-xs leading-tight">
				{integration.disabled ? 'Enable channel' : 'Disable channel'}
			</span>
		</Button>
		<Button
			type="button"
			variant="red"
			size="sm"
			class="w-full justify-start gap-2 sm:w-fit"
			disabled={busy}
			onclick={() => {
				menuOpen = false;
				confirmRemoveOpen = true;
			}}
		>
			<AbstractIcon name={icons.Trash.name} class="size-4 shrink-0" width="16" height="16" />
			<span class="min-w-0 text-start text-xs leading-tight">Delete channel</span>
		</Button>
	</div>
{/snippet}

{#snippet channelTriggerBody()}
	<div class="h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-base-300/80">
		<ImageWithFallback
			src={integration.picture}
			alt=""
			class="h-full w-full object-cover"
			fallbackIcon={providerIcon(integration.identifier)}
		/>
	</div>
	<div class="min-w-0 text-start">
		<div class="truncate text-sm font-medium text-base-content">{integration.name}</div>
	</div>
{/snippet}

{#if variant === 'chip'}
	<div
		class="inline-flex max-w-full items-stretch overflow-hidden rounded-full border border-base-300 bg-base-100 text-base-content shadow-sm"
	>
		<Popover.Root bind:open={menuOpen}>
			<Popover.Trigger
				class="flex max-w-[min(100%,14rem)] min-w-0 flex-1 items-center gap-2 rounded-none border-0 bg-transparent px-2 py-1.5 text-start outline-none hover:bg-base-200/60 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
			>
				{@render channelTriggerBody()}
				<AbstractIcon
					name={icons.ChevronDown.name}
					class="size-4 shrink-0 text-base-content/50 transition-transform duration-200 {menuOpen
						? 'rotate-180'
						: ''}"
					width="16"
					height="16"
				/>
			</Popover.Trigger>
			<Popover.Content align="start" side="bottom" class="w-72 p-3">
				{@render channelActionBody()}
			</Popover.Content>
		</Popover.Root>
		<button
			type="button"
			class="flex shrink-0 items-center border-l border-base-300 bg-transparent px-2.5 outline-none hover:bg-base-200/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-50"
			disabled={busy}
			aria-label="Remove channel"
			onclick={() => (confirmRemoveOpen = true)}
		>
			<AbstractIcon
				name={icons.CircleX.name}
				class="size-4 text-base-content/45"
				width="16"
				height="16"
			/>
		</button>
	</div>
{:else}
	<div class="rounded-lg border border-base-300 bg-base-200/40">
		<Collapsible.Collapsible bind:open={menuOpen} class="w-full">
			<Collapsible.CollapsibleTrigger class="rounded-lg px-3 py-3">
				<div class="flex min-w-0 flex-1 items-center gap-3">
					<div class="h-12 w-12 shrink-0 overflow-hidden rounded-md">
						<ImageWithFallback
							src={integration.picture}
							alt=""
							class="h-full w-full object-cover"
							fallbackIcon={providerIcon(integration.identifier)}
						/>
					</div>
					<div class="min-w-0 text-start">
						<div class="truncate font-medium text-base-content">{integration.name}</div>
						<div class="truncate text-xs text-base-content/60">{integration.identifier}</div>
					</div>
				</div>
				<AbstractIcon
					name={icons.ChevronDown.name}
					class="size-4 shrink-0 transition-transform duration-200 {menuOpen ? 'rotate-180' : ''}"
					width="16"
					height="16"
				/>
			</Collapsible.CollapsibleTrigger>
			<Collapsible.CollapsibleContent class="border-t border-base-300">
				<div class="flex flex-col gap-2 px-3 py-3">
					{@render channelActionBody()}
				</div>
			</Collapsible.CollapsibleContent>
		</Collapsible.Collapsible>
	</div>
{/if}

<Dialog.Root bind:open={confirmRemoveOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
                Delete channel?
            </Dialog.Title>
			<Dialog.Description>
				This disconnects <strong>{integration.name}</strong> from this workspace. You can add it again later.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="gap-2 sm:justify-end">
			<Button type="button" variant="ghost" onclick={() => (confirmRemoveOpen = false)} disabled={busy}>
				Cancel
			</Button>
			<Button
				type="button"
				variant="ghost"
				class="border-0 bg-error text-error-content hover:bg-error/90"
				disabled={busy}
				onclick={handleRemove}
			>
				{#if busy}
					<AbstractIcon name={icons.LoaderCircle.name} class="h-4 w-4 animate-spin" width="16" height="16" />
				{:else}
					Remove
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
