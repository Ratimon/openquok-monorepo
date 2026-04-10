<script lang="ts">
	import type { IconName } from '$data/icon';
	import type { DashboardConnectedChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { icons } from '$data/icon';

	import * as Collapsible from '$lib/ui/collapsible';
	import * as Dialog from '$lib/ui/dialog';
	import { ImageWithFallback } from '$lib/ui/images';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		integration: DashboardConnectedChannelViewModel;
		workspaceId: string;
		providerIcon: (identifier: string) => IconName;
		continueSetupHref: (integration: DashboardConnectedChannelViewModel) => string;
		onRemove: (integrationId: string) => Promise<boolean>;
		onSetDisabled: (integrationId: string, disabled: boolean) => Promise<boolean>;
	};

	let { integration, workspaceId, providerIcon, continueSetupHref, onRemove, onSetDisabled }: Props = $props();

	let menuOpen = $state(false);
	let confirmRemoveOpen = $state(false);
	let busy = $state(false);

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

	async function handleToggleDisabled() {
		busy = true;
		try {
			await onSetDisabled(integration.id, !integration.disabled);
		} finally {
			busy = false;
		}
	}
</script>

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
				<div class="flex flex-wrap gap-2">
					{#if integration.disabled}
						<span class="badge badge-ghost badge-sm">Disabled</span>
					{/if}
					{#if integration.refreshNeeded}
						<span class="badge badge-warning badge-sm">Refresh needed</span>
					{/if}
				</div>
				{#if integration.inBetweenSteps && workspaceId}
					<Button href={continueSetupHref(integration)} size="sm" class="w-fit">
						Complete setup
					</Button>
				{:else if integration.refreshNeeded && workspaceId}
					<Button href={continueSetupHref(integration)} variant="outline" size="sm" class="w-fit">
						Refresh connection
					</Button>
				{/if}
				<Button
					type="button"
					variant="outline"
					size="sm"
					class="w-fit"
					disabled={busy}
					onclick={handleToggleDisabled}
				>
					{integration.disabled ? 'Enable channel' : 'Disable channel'}
				</Button>
				<Button
					type="button"
					variant="red"
					size="sm"
					class="w-fit"
					disabled={busy}
					onclick={() => (confirmRemoveOpen = true)}
				>
					Remove channel
				</Button>
			</div>
		</Collapsible.CollapsibleContent>
	</Collapsible.Collapsible>
</div>

<Dialog.Root bind:open={confirmRemoveOpen}>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
                Remove channel?
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
