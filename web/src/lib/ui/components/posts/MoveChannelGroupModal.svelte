<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { protectedDashboardPagePresenter } from '$lib/area-protected';
	import { icons } from '$data/icons';
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Input from '$lib/ui/input/Input.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		open?: boolean;
		integration: CreateSocialPostChannelViewModel | null;
	};

	let { open = $bindable(false), integration }: Props = $props();

	let filterText = $state('');
	let selectedGroupId = $state<string | null>(null);
	let busy = $state(false);

	const groups = $derived(protectedDashboardPagePresenter.channelGroupsVm);

	const filteredGroups = $derived(
		groups.filter((g) => g.name.toLowerCase().includes(filterText.trim().toLowerCase()))
	);

	$effect(() => {
		if (open && integration) {
			selectedGroupId = integration.group?.id ?? null;
			filterText = integration.group?.name ?? '';
			void protectedDashboardPagePresenter.loadChannelGroups();
		}
		if (!open) {
			filterText = '';
			selectedGroupId = null;
			busy = false;
		}
	});

	function pickGroup(g: { id: string; name: string }) {
		selectedGroupId = g.id;
		filterText = g.name;
	}

	async function handleSave() {
		if (!integration) return;
		const trimmed = filterText.trim();
		busy = true;
		try {
			if (trimmed) {
				const exactByName = groups.find((g) => g.name.toLowerCase() === trimmed.toLowerCase());
				if (exactByName) {
					const r = await protectedDashboardPagePresenter.assignChannelGroup(
						integration.id,
						exactByName.id,
						exactByName.name
					);
					if (r.ok) {
						toast.success('Channel updated.');
						open = false;
					} else {
						toast.error(r.error);
					}
					return;
				}
			}
			if (selectedGroupId && groups.some((g) => g.id === selectedGroupId)) {
				const picked = groups.find((g) => g.id === selectedGroupId)!;
				const r = await protectedDashboardPagePresenter.assignChannelGroup(
					integration.id,
					picked.id,
					picked.name
				);
				if (r.ok) {
					toast.success('Channel updated.');
					open = false;
				} else {
					toast.error(r.error);
				}
				return;
			}
			if (trimmed) {
				const created = await protectedDashboardPagePresenter.createChannelGroup(trimmed);
				if (!created.ok) {
					toast.error(created.error);
					return;
				}
				const assign = await protectedDashboardPagePresenter.assignChannelGroup(
					integration.id,
					created.id,
					created.name
				);
				if (assign.ok) {
					toast.success('Group created and channel assigned.');
					open = false;
				} else {
					toast.error(assign.error);
				}
				return;
			}
			toast.error('Select a group or enter a name.');
		} finally {
			busy = false;
		}
	}

	async function handleRemove() {
		if (!integration) return;
		busy = true;
		try {
			const r = await protectedDashboardPagePresenter.assignChannelGroup(integration.id, null);
			if (r.ok) {
				toast.success('Removed from group.');
				open = false;
			} else {
				toast.error(r.error);
			}
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>
				Move / add to group
			</Dialog.Title>
			<Dialog.Description>
				{#if integration}
					Choose a group for <strong>{integration.name}</strong>, or type a new group name to create one.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-2 space-y-3">
			<div class="space-y-1.5">
				<label class="text-sm font-medium text-base-content" for="move-group-filter">
					Select group
				</label>
				<Input
					id="move-group-filter"
					bind:value={filterText}
					placeholder="Start typing…"
					autocomplete="off"
					disabled={busy || !integration}
					class="bg-base-100"
				/>
			</div>
			{#if filteredGroups.length > 0}
				<div
					class="border-base-300 bg-base-100 max-h-44 overflow-y-auto rounded-md border text-sm shadow-inner"
					role="listbox"
					aria-label="Matching groups"
				>
					{#each filteredGroups as g (g.id)}
						<button
							type="button"
							class="hover:bg-base-200/80 flex w-full items-center px-3 py-2.5 text-start text-base-content outline-none focus-visible:bg-base-200/80 {selectedGroupId === g.id
								? 'bg-primary/10 font-medium'
								: ''}"
							onclick={() => pickGroup(g)}
						>
							{g.name}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<Dialog.Footer class="mt-4 flex flex-wrap items-center gap-2 sm:justify-start">
			<Button type="button" variant="primary" disabled={busy || !integration} onclick={() => void handleSave()}>
				{#if busy}
					<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
				{:else}
					Save
				{/if}
			</Button>
			{#if integration?.group}
				<Button type="button" variant="red" disabled={busy} onclick={() => void handleRemove()}>
					Remove from group
				</Button>
			{/if}
			<Button type="button" variant="ghost" disabled={busy} onclick={() => (open = false)}>Cancel</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
