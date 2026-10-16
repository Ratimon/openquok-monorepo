<script lang="ts">
	import type { CreateSocialPostChannelViewModel } from '$lib/area-protected/ProtectedHomePage.presenter.svelte';

	import { protectedHomePagePresenter } from '$lib/area-protected';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import type {
		AutoLaunchProductProfileDto,
		BusinessProfileDataFormValues,
		BusinessProfileDto
	} from '$lib/auto-launch/auto-launch.types';
	import ProductProfileComposer from '$lib/ui/components/auto-launch/ProductProfileComposer.svelte';
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

	let composerOpen = $state(false);
	let composerSubmitting = $state(false);
	let composerRef: ProductProfileComposer | undefined = $state();
	let composerInitial = $state<Partial<AutoLaunchProductProfileDto> | null>(null);
	let composerTitle = $state('Create business profile');
	/** Channel to link after full-profile save (move modal may be closed). */
	let linkPendingIntegration = $state<CreateSocialPostChannelViewModel | null>(null);

	const workspaceId = $derived(workspaceSettingsPresenter.currentWorkspaceId);

	const pickerOptions = $derived(businessProfileDtosToPickerOptions(businessProfiles));

	const filteredOptions = $derived(
		pickerOptions.filter((o) =>
			o.name.toLowerCase().includes(filterText.trim().toLowerCase())
		)
	);

	const fullProfilePickerTarget = $derived.by((): BusinessProfilePickerOption | null => {
		const picked = selectedOptionKey
			? pickerOptions.find((o) => o.key === selectedOptionKey)
			: undefined;
		if (picked?.productProfileId) return picked;

		const trimmed = filterText.trim().toLowerCase();
		if (trimmed) {
			const byName = pickerOptions.find((o) => o.name.toLowerCase() === trimmed);
			if (byName?.productProfileId) return byName;
		}

		const groupId = integration?.group?.id;
		if (groupId) {
			const forGroup = pickerOptions.find(
				(o) => o.integrationCustomerId === groupId && o.productProfileId
			);
			if (forGroup) return forGroup;
		}

		return picked ?? null;
	});

	const fullProfileButtonLabel = $derived(
		fullProfilePickerTarget?.productProfileId ? 'Edit full profile' : 'Create full profile'
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

	$effect(() => {
		if (!composerOpen) {
			composerInitial = null;
			linkPendingIntegration = null;
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

	type ProfileSavePayload = {
		name: string;
		tagline: string | null;
		description: string | null;
		websiteUrl: string | null;
		logoUrl: string | null;
		profileData: BusinessProfileDataFormValues;
		integrationCustomerId?: string | null;
	};

	function withUploadedMedia(
		values: ProfileSavePayload,
		media: { logoUrl?: string | null; galleryUrls?: string[] }
	): ProfileSavePayload {
		return {
			...values,
			logoUrl: media.logoUrl !== undefined ? media.logoUrl : values.logoUrl,
			profileData: {
				...values.profileData,
				gallery_urls: media.galleryUrls ?? values.profileData.gallery_urls
			}
		};
	}

	async function openCreateFullProfile() {
		if (!integration) return;
		const trimmed = filterText.trim();
		const picked = selectedOptionKey
			? pickerOptions.find((o) => o.key === selectedOptionKey)
			: undefined;
		const editTarget = fullProfilePickerTarget;

		if (editTarget?.productProfileId) {
			const full = await autoLaunchRepository.getProfileById(editTarget.productProfileId);
			if (!full) {
				toast.error('Could not load that business profile.');
				return;
			}
			composerInitial = full;
			composerTitle = 'Edit business profile';
		} else if (picked) {
			composerInitial = {
				name: picked.name,
				integrationCustomerId: picked.integrationCustomerId
			};
			composerTitle = 'Create business profile';
		} else if (trimmed) {
			composerInitial = { name: trimmed };
			composerTitle = 'Create business profile';
		} else {
			toast.error('Enter a profile name or pick an existing profile.');
			return;
		}

		linkPendingIntegration = integration;
		open = false;
		composerOpen = true;
	}

	async function saveFullProfile(values: ProfileSavePayload) {
		const orgId = workspaceId;
		const channel = linkPendingIntegration;
		if (!orgId || !channel) return;

		composerSubmitting = true;
		try {
			const editingId = composerInitial?.id ?? null;
			let customerId: string | null = null;
			let displayName = values.name;

			if (editingId) {
				const media = await composerRef?.uploadMediaForProfile(editingId);
				const payload = withUploadedMedia(values, media ?? {});
				const result = await autoLaunchRepository.updateProfile(editingId, payload);
				if (!result.ok) {
					toast.error(result.error);
					return;
				}
				customerId = result.profile.integrationCustomerId;
				displayName = result.profile.name;
				toast.success('Business profile updated.');
			} else {
				const result = await autoLaunchRepository.createProfile({
					organizationId: orgId,
					...values,
					integrationCustomerId:
						values.integrationCustomerId ?? composerInitial?.integrationCustomerId ?? null
				});
				if (!result.ok) {
					toast.error(result.error);
					return;
				}
				const newId = result.profile.id;
				customerId = result.profile.integrationCustomerId;
				displayName = result.profile.name;
				const media = await composerRef?.uploadMediaForProfile(newId);
				const hasMediaPatch =
					media &&
					(media.logoUrl !== undefined ||
						(media.galleryUrls !== undefined && media.galleryUrls.length > 0));
				if (hasMediaPatch) {
					const patch = withUploadedMedia(values, media);
					const patchResult = await autoLaunchRepository.updateProfile(newId, patch);
					if (!patchResult.ok) {
						toast.error(patchResult.error);
						return;
					}
				}
				toast.success('Business profile created.');
			}

			if (!customerId) {
				toast.error('Could not link business profile to a channel group.');
				return;
			}

			await protectedHomePagePresenter.loadChannelGroups();
			const linked = await protectedHomePagePresenter.assignChannelGroup(
				channel.id,
				customerId,
				displayName
			);
			if (!linked.ok) {
				toast.error(linked.error);
				return;
			}

			toast.success('Channel linked to business profile.');
			composerOpen = false;
		} finally {
			composerSubmitting = false;
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
					Link <strong>{integration.name}</strong> to a business profile. Use <strong>Save now</strong> for a
					quick name-only link, or <strong>{fullProfileButtonLabel}</strong>.
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
			<Button
				type="button"
				variant="primary"
				disabled={busy || composerSubmitting || !integration}
				onclick={() => void handleSave()}
			>
				{#if busy}
					<AbstractIcon name={icons.LoaderCircle.name} class="size-4 animate-spin" width="16" height="16" />
				{:else}
					Save now
				{/if}
			</Button>
			<Button
				type="button"
				variant="outline"
				disabled={busy || composerSubmitting || !integration}
				onclick={() => void openCreateFullProfile()}
			>
				{fullProfileButtonLabel}
			</Button>
			{#if integration?.group}
				<Button type="button" variant="red" disabled={busy || composerSubmitting} onclick={() => void handleRemove()}>
					Remove from profile
				</Button>
			{/if}
			<Button type="button" variant="ghost" disabled={busy || composerSubmitting} onclick={() => (open = false)}>
				Cancel
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<ProductProfileComposer
	bind:this={composerRef}
	bind:open={composerOpen}
	organizationId={workspaceId}
	initial={composerInitial}
	submitting={composerSubmitting}
	title={composerTitle}
	onSubmit={saveFullProfile}
/>
