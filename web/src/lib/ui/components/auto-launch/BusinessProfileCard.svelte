<script lang="ts">
	import type { AutoLaunchSubmissionDto } from '$lib/auto-launch/auto-launch.types';
	import type { DirectoryLaunchSiteSummaryRow } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
	import type { BusinessProfileLaunchCardVm } from '$lib/auto-launch/utils/buildProfileLaunchCardVm';

	import { cn } from '$lib/ui/helpers/common';

	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import BusinessProfileDirectoryPanel from '$lib/ui/components/auto-launch/BusinessProfileDirectoryPanel.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type ComposerTabHint = 'discovery' | 'general';

	type Props = {
		vm: BusinessProfileLaunchCardVm;
		directorySiteRows: DirectoryLaunchSiteSummaryRow[];
		submissionsByDestinationId: Map<string, AutoLaunchSubmissionDto>;
		organizationId: string;
		suggestedAuthEmail: string | null;
		directoryChannelsDefaultOpen?: boolean;
		onDirectoryListingSaved?: (submission: AutoLaunchSubmissionDto) => void | Promise<void>;
		onDirectoryListingRemoved?: (payload: {
			productProfileId: string;
			submissionId: string;
		}) => void | Promise<void>;
		onEdit: (profileId: string, tab?: ComposerTabHint) => void;
		onDelete: (profileId: string) => void;
	};

	let {
		vm,
		directorySiteRows,
		submissionsByDestinationId,
		organizationId,
		suggestedAuthEmail,
		directoryChannelsDefaultOpen = true,
		onDirectoryListingSaved,
		onDirectoryListingRemoved,
		onEdit,
		onDelete
	}: Props = $props();

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
			<Button type="button" variant="ghost" size="sm" onclick={() => onDelete(vm.profileId)}>
				Delete
			</Button>
		</div>
	</header>

	<div class="mt-3 space-y-1.5 text-sm">
		<p class="font-medium text-base-content/85">{vm.directoriesSubmittedLabel}</p>
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
		defaultOpen={directoryChannelsDefaultOpen}
		onListingDetailsSaved={onDirectoryListingSaved}
		onListingDetailsRemoved={onDirectoryListingRemoved}
	/>
</article>
