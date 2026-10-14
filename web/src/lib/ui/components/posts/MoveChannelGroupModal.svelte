<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

	import { protectedHomePagePresenter } from '$lib/area-protected';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import type { BusinessProfileDto } from '$lib/auto-launch/auto-launch.types';
	import {
		businessProfileDtosToPickerOptions,
		type BusinessProfilePickerOption
	} from '$lib/auto-launch';
	import { resolveIntegrationCustomerForPickerOption } from '$lib/auto-launch';
	import { workspaceSettingsPresenter } from '$lib/settings';
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
	let selectedOptionKey = $state<string | null>(null);
	let businessProfiles = $state<BusinessProfileDto[]>([]);
	let busy = $state(false);

	const pickerOptions = $derived(businessProfileDtosToPickerOptions(businessProfiles));

	const filteredOptions = $derived(
		pickerOptions.filter((o) =>
			o.name.toLowerCase().includes(filterText.trim().toLowerCase())
		)
	);

	async function loadPickerData() {
		const orgId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			businessProfiles = [];
			return;
		}
		businessProfiles = await autoLaunchRepository.listBusinessProfiles(orgId);
		await protectedHomePagePresenter.loadChannelGroups();
	}

	$effect(() => {
		if (open && integration) {
			selectedOptionKey = integration.group?.id ?? null;
			filterText = integration.group?.name ?? '';
			void loadPickerData();
		}
		if (!open) {
			filterText = '';
			selectedOptionKey = null;
			businessProfiles = [];
			busy = false;
		}
	});

	function pickOption(option: BusinessProfilePickerOption) {
		selectedOptionKey = option.key;
		filterText = option.name;
	}

	async function assignToResolvedCustomer(
		integrationCustomerId: string,
		displayName: string,
		successMessage = 'Channel linked to business profile.'
	) {
		if (!integration) return false;
		const resultVm = await protectedHomePagePresenter.assignChannelGroup(
			integration.id,
			integrationCustomerId,
			displayName
		);
		if (resultVm.ok) {
			toast.success(successMessage);
			open = false;
			return true;
		}
		toast.error(resultVm.error);
		return false;
	}

	async function resolveAndAssign(option: BusinessProfilePickerOption) {
		const orgId = workspaceSettingsPresenter.currentWorkspaceId;
		if (!orgId) {
			toast.error('No workspace selected.');
			return;
		}
		const resolved = await resolveIntegrationCustomerForPickerOption(orgId, option);
		if (!resolved.ok) {
			toast.error(resolved.error);
			return;
		}
		await assignToResolvedCustomer(resolved.integrationCustomerId, resolved.name);
	}

	async function handleSave() {
		if (!integration) return;
		const trimmed = filterText.trim();
		busy = true;
		try {
			if (trimmed) {
				const exactByName = pickerOptions.find(
					(o) => o.name.toLowerCase() === trimmed.toLowerCase()
				);
				if (exactByName) {
					await resolveAndAssign(exactByName);
					return;
				}
			}
			if (selectedOptionKey) {
				const picked = pickerOptions.find((o) => o.key === selectedOptionKey);
				if (picked) {
					await resolveAndAssign(picked);
					return;
				}
			}
			if (trimmed) {
				const orgId = workspaceSettingsPresenter.currentWorkspaceId;
				if (!orgId) {
					toast.error('No workspace selected.');
					return;
				}
				const created = await autoLaunchRepository.createProfile({
					organizationId: orgId,
					name: trimmed,
					profileData: {}
				});
				if (!created.ok) {
					toast.error(created.error);
					return;
				}
				const customerId = created.profile.integrationCustomerId;
				if (!customerId) {
					toast.error('Could not link business profile to a channel group.');
					return;
				}
				await protectedHomePagePresenter.loadChannelGroups();
				await assignToResolvedCustomer(
					customerId,
					created.profile.name,
					'Business profile created and channel linked.'
				);
				return;
			}
			toast.error('Select a business profile or enter a name.');
		} finally {
			busy = false;
		}
	}

	async function handleRemove() {
		if (!integration) return;
		busy = true;
		try {
			const resultVm = await protectedHomePagePresenter.assignChannelGroup(integration.id, null);
			if (resultVm.ok) {
				toast.success('Removed from business profile.');
				open = false;
			} else {
				toast.error(resultVm.error);
			}
		} finally {
			busy = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title>Move / add to business profile</Dialog.Title>
			<Dialog.Description>
				{#if integration}
					Link <strong>{integration.name}</strong> to a business profile, or type a new profile name (same as
					Products tab).
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		<div class="mt-2 space-y-3">
			<div class="space-y-1.5">
				<label class="text-sm font-medium text-base-content" for="move-group-filter">
					Business profile
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
			{#if filteredOptions.length > 0}
				<div
					class="border-base-300 bg-base-100 max-h-44 overflow-y-auto rounded-md border text-sm shadow-inner"
					role="listbox"
					aria-label="Matching business profiles"
				>
					{#each filteredOptions as option (option.key)}
						<button
							type="button"
							class="hover:bg-base-200/80 flex w-full items-center px-3 py-2.5 text-start text-base-content outline-none focus-visible:bg-base-200/80 {selectedOptionKey === option.key
								? 'bg-primary/10 font-medium'
								: ''}"
							onclick={() => pickOption(option)}
						>
							{option.name}
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
					Remove from profile
				</Button>
			{/if}
			<Button type="button" variant="ghost" disabled={busy} onclick={() => (open = false)}>
				Cancel</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
