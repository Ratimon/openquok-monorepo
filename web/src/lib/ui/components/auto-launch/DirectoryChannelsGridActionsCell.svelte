<script lang="ts">
	import type { ICellProps } from '@svar-ui/svelte-grid';
	import { getContext } from 'svelte';

	import type { ProductDirectoryChannelTableRowViewModel } from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

	import AddDirectoryLaunch from '$lib/ui/components/auto-launch/AddDirectoryLaunch.svelte';
	import {
		directoryChannelsGridContextKey,
		type DirectoryChannelsGridContext
	} from '$lib/ui/components/auto-launch/directoryChannelsGridContext';
	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	let { row }: ICellProps = $props();

	const ctx = getContext<DirectoryChannelsGridContext>(directoryChannelsGridContextKey);
	const rowVm = $derived(row as unknown as ProductDirectoryChannelTableRowViewModel);
</script>

<div class="directory-channels-actions-cell flex min-h-7 flex-nowrap items-center gap-1">
	{#if rowVm.rowKind === 'site'}
		{#if rowVm.opportunityCount > 0 && ctx}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class="btn-xs h-7 min-h-0 shrink-0 gap-1 whitespace-nowrap px-2"
				aria-expanded={rowVm.isSiteExpanded}
				onclick={() => ctx.toggleSiteExpanded(rowVm.siteKey)}
			>
				<AbstractIcon
					name={icons.ChevronRight.name}
					class="size-3.5 shrink-0 transition-transform duration-200 {rowVm.isSiteExpanded
						? 'rotate-90'
						: ''}"
					width="14"
					height="14"
					aria-hidden="true"
				/>
				{rowVm.isSiteExpanded ? 'Hide' : 'Show'}
			</Button>
		{/if}
		{#if rowVm.showLaunch && ctx?.productProfileId}
			<span class="inline-flex shrink-0">
				<AddDirectoryLaunch
					buttonLabel="Launch"
					buttonVariant="primary"
					buttonClass="btn-xs whitespace-nowrap"
					sitePickerFirst={false}
					providerSlugPrefix={`${rowVm.siteKey}-`}
					destinationsDialogTitle={`${rowVm.siteLabel} launches`}
					productProfileId={ctx.productProfileId}
				/>
			</span>
		{/if}
	{:else if ctx?.productProfileId}
		{#if rowVm.showLaunch}
			<span class="inline-flex shrink-0">
				<AddDirectoryLaunch
					buttonLabel="Launch"
					buttonVariant="primary"
					buttonClass="btn-xs whitespace-nowrap"
					sitePickerFirst={false}
					destinationProviderSlug={rowVm.providerSlug}
					destinationsDialogTitle={rowVm.opportunityLabel}
					productProfileId={ctx.productProfileId}
				/>
			</span>
		{/if}
		{#if rowVm.showRefill}
			<span class="inline-flex shrink-0">
				<AddDirectoryLaunch
					buttonLabel="Re-fill"
					buttonVariant="outline"
					buttonClass="btn-xs whitespace-nowrap"
					sitePickerFirst={false}
					destinationProviderSlug={rowVm.providerSlug}
					destinationsDialogTitle={rowVm.opportunityLabel}
					productProfileId={ctx.productProfileId}
				/>
			</span>
		{/if}
		{#if rowVm.submissionStatus !== 'completed'}
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="btn-xs h-7 min-h-0 shrink-0 whitespace-nowrap px-2"
				title="Mark launch complete"
				onclick={() => ctx.openListingDetails(rowVm, 'complete')}
			>
				Complete
			</Button>
		{/if}
		{#if rowVm.submissionStatus === 'completed' && rowVm.submissionId && ctx}
			<label
				class="flex h-7 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 text-xs text-base-content/80"
				title="Uncheck to remove completion"
			>
				<input
					type="checkbox"
					class="checkbox checkbox-sm checkbox-success"
					checked
					onchange={(event) => {
						event.preventDefault();
						const input = event.currentTarget as HTMLInputElement;
						input.checked = true;
						ctx.requestRemoveCompletion(rowVm);
					}}
				/>
				<span class="hidden sm:inline">Done</span>
			</label>
		{/if}
		{#if rowVm.submissionId}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				class="btn-xs h-7 min-h-0 shrink-0 whitespace-nowrap px-2"
				onclick={() => ctx.openListingDetails(rowVm, 'edit')}
			>
				Edit
			</Button>
		{/if}
	{/if}
</div>
