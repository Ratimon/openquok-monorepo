<script lang="ts">
	import type { DashboardConnectedChannelViewModel } from '$lib/area-protected/ProtectedDashboardPage.presenter.svelte';

	import { protectedDashboardPagePresenter } from '$lib/area-protected';
	import { icons } from '$data/icon';
	import * as Dialog from '$lib/ui/dialog';
	import Button from '$lib/ui/buttons/Button.svelte';
	import Input from '$lib/ui/input/Input.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		open?: boolean;
		integration: DashboardConnectedChannelViewModel | null;
	};

	let { open = $bindable(false), integration }: Props = $props();

	let filterText = $state('');
	let selectedCustomerId = $state<string | null>(null);
	let busy = $state(false);

	const customers = $derived(protectedDashboardPagePresenter.channelCustomers);

	const filteredCustomers = $derived(
		customers.filter((c) => c.name.toLowerCase().includes(filterText.trim().toLowerCase()))
	);

	$effect(() => {
		if (open && integration) {
			selectedCustomerId = integration.customer?.id ?? null;
			filterText = integration.customer?.name ?? '';
			void protectedDashboardPagePresenter.loadChannelCustomers();
		}
		if (!open) {
			filterText = '';
			selectedCustomerId = null;
			busy = false;
		}
	});

	function pickCustomer(c: { id: string; name: string }) {
		selectedCustomerId = c.id;
		filterText = c.name;
	}

	async function handleSave() {
		if (!integration) return;
		const trimmed = filterText.trim();
		busy = true;
		try {
			if (trimmed) {
				const exactByName = customers.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
				if (exactByName) {
					const r = await protectedDashboardPagePresenter.assignChannelCustomer(
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
			if (selectedCustomerId && customers.some((c) => c.id === selectedCustomerId)) {
				const picked = customers.find((c) => c.id === selectedCustomerId)!;
				const r = await protectedDashboardPagePresenter.assignChannelCustomer(
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
				const created = await protectedDashboardPagePresenter.createChannelCustomer(trimmed);
				if (!created.ok) {
					toast.error(created.error);
					return;
				}
				const assign = await protectedDashboardPagePresenter.assignChannelCustomer(
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
			const r = await protectedDashboardPagePresenter.assignChannelCustomer(integration.id, null);
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
				<label class="text-sm font-medium text-base-content" for="move-customer-filter">
					Select group
				</label>
				<Input
					id="move-customer-filter"
					bind:value={filterText}
					placeholder="Start typing…"
					autocomplete="off"
					disabled={busy || !integration}
					class="bg-base-100"
				/>
			</div>
			{#if filteredCustomers.length > 0}
				<div
					class="border-base-300 bg-base-100 max-h-44 overflow-y-auto rounded-md border text-sm shadow-inner"
					role="listbox"
					aria-label="Matching groups"
				>
					{#each filteredCustomers as c (c.id)}
						<button
							type="button"
							class="hover:bg-base-200/80 flex w-full items-center px-3 py-2.5 text-start text-base-content outline-none focus-visible:bg-base-200/80 {selectedCustomerId === c.id
								? 'bg-primary/10 font-medium'
								: ''}"
							onclick={() => pickCustomer(c)}
						>
							{c.name}
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
			{#if integration?.customer}
				<Button type="button" variant="red" disabled={busy} onclick={() => void handleRemove()}>
					Remove from group
				</Button>
			{/if}
			<Button type="button" variant="ghost" disabled={busy} onclick={() => (open = false)}>Cancel</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
