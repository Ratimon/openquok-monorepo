<script lang="ts">
	import type {
		AutoLaunchProductProfileDto,
		AutoLaunchSubmissionDto
	} from '$lib/auto-launch/auto-launch.types';
	import type { DirectoryLaunchSiteSummaryRow } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
	import type { DirectoryProfileVariantRowViewModel } from '$lib/auto-launch/AutoLaunchProducts.presenter.svelte';
	import type { BusinessProfileLaunchCardVm } from '$lib/auto-launch/utils/buildProfileLaunchCardVm';
	import type { AutoLaunchDestinationDto } from '$lib/auto-launch/auto-launch.types';
	import type {
		DeleteBusinessProfileModalData,
		DeleteBusinessProfileModalResult
	} from '$lib/auto-launch/deleteBusinessProfileModal.types';

	import { cn } from '$lib/ui/helpers/common';
	import { icons } from '$data/icons';
	import { destructiveGhostButtonClass } from '$lib/ui/constants/destructiveButtonClasses';

	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import BusinessProfileDirectoryPanel from '$lib/ui/components/auto-launch/BusinessProfileDirectoryPanel.svelte';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type ComposerTabHint = 'discovery' | 'general';

	type Props = {
		vm: BusinessProfileLaunchCardVm;
		directorySiteRows: DirectoryLaunchSiteSummaryRow[];
		submissionsByDestinationId: Map<string, AutoLaunchSubmissionDto>;
		publishedDestinations: AutoLaunchDestinationDto[];
		directoryVariants: DirectoryProfileVariantRowViewModel[];
		variantProfileIdsBySiteKey: Map<string, string>;
		organizationId: string;
		suggestedAuthEmail: string | null;
		directoryChannelsDefaultOpen?: boolean;
		onDirectoryListingSaved?: (submission: AutoLaunchSubmissionDto) => void | Promise<void>;
		onDirectoryListingRemoved?: (payload: {
			productProfileId: string;
			submissionId: string;
		}) => void | Promise<void>;
		onCreateDirectoryVariant?: (
			mainProfileId: string,
			directorySiteKey: string
		) => Promise<{ ok: true; profileId: string } | { ok: false; error: string }>;
		onEdit: (profileId: string, tab?: ComposerTabHint) => void;
		deleteBusinessProfileForModal: (
			data: DeleteBusinessProfileModalData
		) => Promise<DeleteBusinessProfileModalResult>;
	};

	let {
		vm,
		directorySiteRows,
		submissionsByDestinationId,
		publishedDestinations,
		directoryVariants,
		variantProfileIdsBySiteKey,
		organizationId,
		suggestedAuthEmail,
		directoryChannelsDefaultOpen = true,
		onDirectoryListingSaved,
		onDirectoryListingRemoved,
		onCreateDirectoryVariant,
		onEdit,
		deleteBusinessProfileForModal
	}: Props = $props();

	let deleteModalOpen = $state(false);
	let deleteModalTarget = $state<DeleteBusinessProfileModalData | null>(null);

	const deleteModalTitle = $derived(
		deleteModalTarget?.isVariant ? 'Delete directory variant' : 'Delete business profile'
	);

	const deleteModalDescription = $derived.by(() => {
		if (!deleteModalTarget) return '';
		if (deleteModalTarget.isVariant) {
			return `Delete the ${deleteModalTarget.displayLabel} tailored profile? Launches on this directory will use your main profile copy again.`;
		}
		return `Remove "${deleteModalTarget.displayLabel}"? Tailored directory variants and launch progress for this product will be removed. This cannot be undone.`;
	});

	const profileInitial = $derived((vm.name || 'P').trim().slice(0, 1).toUpperCase());

	const websiteDisplay = $derived.by(() => {
		const raw = vm.websiteUrl?.trim();
		if (!raw) return null;
		try {
			const host = new URL(raw).hostname.replace(/^www\./, '');
			return host || raw;
		} catch {
			return raw.length > 48 ? `${raw.slice(0, 45)}…` : raw;
		}
	});

	const statusBadge = $derived(
		vm.isLive
			? { label: 'Live', class: 'badge-success badge-outline' }
			: { label: 'Draft', class: 'badge-ghost' }
	);

	function openDeleteMainProfileModal(): void {
		deleteModalTarget = {
			profileId: vm.profileId,
			isVariant: false,
			displayLabel: vm.name
		};
		deleteModalOpen = true;
	}

	function openDeleteVariantModal(variant: AutoLaunchProductProfileDto): void {
		deleteModalTarget = {
			profileId: variant.id,
			isVariant: true,
			displayLabel: variant.directorySiteKey ?? 'directory'
		};
		deleteModalOpen = true;
	}

	async function executeDeleteProfile(data: unknown): Promise<DeleteBusinessProfileModalResult> {
		return deleteBusinessProfileForModal(data as DeleteBusinessProfileModalData);
	}
</script>

<article
	class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-md ring-1 ring-base-content/5"
>
	<header class="flex items-start justify-between gap-3">
		<div class="flex min-w-0 flex-1 gap-3">
			<div
				class={cn(
					'grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-base-300/80 bg-base-100 text-lg font-semibold text-base-content/70',
					vm.logoUrl && 'border-transparent'
				)}
			>
				{#if vm.logoUrl}
					<img src={vm.logoUrl} alt="" class="size-full object-cover" width="56" height="56" />
				{:else}
					<span aria-hidden="true">{profileInitial}</span>
				{/if}
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h2 class="text-base font-semibold text-base-content">{vm.name}</h2>
					<span class="badge badge-sm {statusBadge.class}">{statusBadge.label}</span>
				</div>
				{#if vm.tagline}
					<p class="mt-0.5 text-sm text-base-content/75 line-clamp-2">{vm.tagline}</p>
				{/if}
				{#if websiteDisplay}
					<p class="mt-1 truncate text-sm text-base-content/55" title={vm.websiteUrl ?? undefined}>
						{websiteDisplay}
					</p>
				{/if}
			</div>
		</div>
		<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
			<Button type="button" variant="primary" size="sm" onclick={() => onEdit(vm.profileId)}>
				Edit profile
			</Button>
			<AddDirectoryLaunch
				buttonLabel="Add directory launch"
				buttonVariant="secondary"
				buttonClass="btn-sm"
				sitePickerFirst={true}
				productProfileId={vm.profileId}
				onDirectoryListingSaved={onDirectoryListingSaved}
			/>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class={destructiveGhostButtonClass}
				onclick={openDeleteMainProfileModal}
			>
				Delete
			</Button>
		</div>
	</header>

	<div class="mt-3 space-y-1.5 text-sm">
		<p class="font-medium text-base-content/85">{vm.directoriesSubmittedLabel}</p>
		{#if directoryVariants.length > 0}
			<ul class="mt-2 space-y-1.5 rounded-lg border border-base-300/80 bg-base-200/40 px-3 py-2 text-xs">
				{#each directoryVariants as variantRow (variantRow.profile.id)}
					<li class="space-y-1">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<span class="font-medium text-base-content/80">
								{variantRow.profile.directorySiteKey ?? 'Directory'} variant
								{#if variantRow.profile.similarityToMainPercent != null}
									<span class="badge badge-sm badge-ghost ml-1">
										{variantRow.profile.similarityToMainPercent}% match
									</span>
								{/if}
							</span>
							<div class="flex flex-wrap items-center gap-1">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class="btn-xs h-7 min-h-0"
									onclick={() => onEdit(variantRow.profile.id)}
								>
									Edit variant
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class={cn('btn-xs h-7 min-h-0', destructiveGhostButtonClass)}
									onclick={() => openDeleteVariantModal(variantRow.profile)}
								>
									Delete variant
								</Button>
							</div>
						</div>
						{#if variantRow.driftWarning}
							<p class="text-warning">{variantRow.driftWarning}</p>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
		{#if vm.summary.staleCount > 0}
			<p class="text-xs text-warning">
				{vm.summary.staleCount}
				{vm.summary.staleCount === 1 ? 'listing may be out of date' : 'listings may be out of date'} after
				profile edits.
			</p>
		{/if}
		{#if vm.readinessHint}
			<button
				type="button"
				class="text-left text-xs text-primary underline-offset-2 hover:underline"
				onclick={() =>
					onEdit(vm.profileId, vm.composerTabForReadinessHint ?? 'general')}
			>
				{vm.readinessHint}
			</button>
		{/if}
	</div>

	<BusinessProfileDirectoryPanel
		productProfileId={vm.profileId}
		{organizationId}
		{suggestedAuthEmail}
		siteRows={directorySiteRows}
		{submissionsByDestinationId}
		{publishedDestinations}
		{variantProfileIdsBySiteKey}
		onOpenVariantProfile={(profileId) => onEdit(profileId)}
		onCreateDirectoryVariant={onCreateDirectoryVariant}
		defaultOpen={directoryChannelsDefaultOpen}
		onListingDetailsSaved={onDirectoryListingSaved}
		onListingDetailsRemoved={onDirectoryListingRemoved}
	/>
</article>

{#if deleteModalTarget}
	<ActionVerificationModal
		data={deleteModalTarget}
		bind:open={deleteModalOpen}
		executionFunction={executeDeleteProfile}
		buttonIconName={icons.Trash.name}
		buttonText={deleteModalTarget.isVariant ? 'Delete variant' : 'Delete profile'}
		modalTitle={deleteModalTitle}
		modalDescription={deleteModalDescription}
		modalVerficationWithAnswer={false}
		confirmButtonVariant="red"
		onSuccess={() => {
			deleteModalTarget = null;
		}}
	/>
{/if}
