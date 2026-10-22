<script lang="ts">
	import { browser } from '$app/environment';
	import { setContext, untrack } from 'svelte';

	import type {
		AutoLaunchDestinationDto,
		AutoLaunchSubmissionDto
	} from '$lib/auto-launch/auto-launch.types';
	import { autoLaunchRepository } from '$lib/auto-launch';
	import type { DirectoryLaunchSiteSummaryRow } from '$lib/auto-launch/groupDirectoryLaunchSiteSummaryRows';
	import { createProductDirectoryChannelsGridTableFilter } from '$lib/auto-launch/ProductDirectoryChannelsGridFilterBuilder.presenter.svelte';
	import { ProductDirectoryChannelsGridFilterBuilderPresenter } from '$lib/auto-launch/ProductDirectoryChannelsGridFilterBuilder.presenter.svelte';
	import {
		ProductDirectoryChannelsGridTablePresenter,
		type ProductDirectoryChannelTableRowViewModel
	} from '$lib/auto-launch/ProductDirectoryChannelsGridTable.presenter.svelte';

	import { icons } from '$data/icons';

	import DirectoryChannelListingDetailsModal from '$lib/ui/components/auto-launch/DirectoryChannelListingDetailsModal.svelte';
	import DirectoryChannelsGridLayout from '$lib/ui/components/auto-launch/DirectoryChannelsGridLayout.svelte';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';
	import {
		directoryChannelsGridContextKey,
		type DirectoryChannelsGridContext
	} from '$lib/ui/components/auto-launch/directoryChannelsGridContext';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { toast } from '$lib/ui/sonner';

	type Props = {
		productProfileId: string;
		organizationId: string;
		suggestedAuthEmail: string | null;
		siteRows: DirectoryLaunchSiteSummaryRow[];
		submissionsByDestinationId: Map<string, AutoLaunchSubmissionDto>;
		publishedDestinations: AutoLaunchDestinationDto[];
		variantProfileIdsBySiteKey: Map<string, string>;
		onOpenVariantProfile?: (profileId: string) => void;
		onCreateDirectoryVariant?: (
			mainProfileId: string,
			directorySiteKey: string
		) => Promise<{ ok: true; profileId: string } | { ok: false; error: string }>;
		onListingDetailsSaved?: (submission: AutoLaunchSubmissionDto) => void | Promise<void>;
		onListingDetailsRemoved?: (payload: {
			productProfileId: string;
			submissionId: string;
		}) => void | Promise<void>;
		defaultOpen?: boolean;
	};

	let {
		productProfileId,
		organizationId,
		suggestedAuthEmail,
		siteRows,
		submissionsByDestinationId,
		publishedDestinations,
		variantProfileIdsBySiteKey,
		onOpenVariantProfile,
		onCreateDirectoryVariant,
		onListingDetailsSaved,
		onListingDetailsRemoved,
		defaultOpen = true
	}: Props = $props();

	let panelOpen = $state(untrack(() => defaultOpen));

	const gridTablePresenter = new ProductDirectoryChannelsGridTablePresenter();
	const filterPresenter = new ProductDirectoryChannelsGridFilterBuilderPresenter();

	const DIRECTORY_CHANNELS_GRID_PAGE_SIZE = 25;
	let gridPage = $state(1);
	let gridPageSize = $state(DIRECTORY_CHANNELS_GRID_PAGE_SIZE);
	let gridHostEl = $state<HTMLDivElement | null>(null);
	let gridHostWidthPx = $state(0);

	let listingModalOpen = $state(false);
	let listingModalMode = $state<'complete' | 'edit'>('complete');
	let listingModalRow = $state<ProductDirectoryChannelTableRowViewModel | null>(null);
	let listingModalSubmitting = $state(false);
	let expandedSiteKeys = $state<Set<string>>(new Set());
	let removeCompletionModalOpen = $state(false);
	let removeCompletionRow = $state<ProductDirectoryChannelTableRowViewModel | null>(null);
	let tailorBusySiteKey = $state<string | null>(null);

	type RemoveCompletionModalData = {
		submissionId: string;
		organizationId: string;
		opportunityLabel: string;
	};

	function toggleSiteExpanded(siteKey: string): void {
		const next = new Set(expandedSiteKeys);
		if (next.has(siteKey)) next.delete(siteKey);
		else next.add(siteKey);
		expandedSiteKeys = next;
	}

	function openListingDetails(
		row: ProductDirectoryChannelTableRowViewModel,
		mode: 'complete' | 'edit'
	): void {
		listingModalRow = row;
		listingModalMode = mode;
		listingModalOpen = true;
	}

	function requestRemoveCompletion(row: ProductDirectoryChannelTableRowViewModel): void {
		if (!row.submissionId) return;
		removeCompletionRow = row;
		removeCompletionModalOpen = true;
	}

	function openMarkIncompleteFromEditModal(): void {
		if (!listingModalRow?.submissionId) return;
		const row = listingModalRow;
		listingModalOpen = false;
		listingModalRow = null;
		removeCompletionRow = row;
		removeCompletionModalOpen = true;
	}

	async function executeRemoveCompletion(
		data: unknown
	): Promise<{ success: boolean; message: string }> {
		const payload = data as RemoveCompletionModalData;
		const resultVm = await autoLaunchRepository.deleteCompletedSubmission(
			payload.submissionId,
			payload.organizationId
		);
		if (!resultVm.ok) {
			return { success: false, message: resultVm.error };
		}
		return {
			success: true,
			message: `Marked ${payload.opportunityLabel} as incomplete.`
		};
	}

	async function tailorForDirectory(row: ProductDirectoryChannelTableRowViewModel): Promise<void> {
		if (!onCreateDirectoryVariant || row.rowKind !== 'opportunity') return;
		tailorBusySiteKey = row.siteKey;
		try {
			const resultVm = await onCreateDirectoryVariant(productProfileId, row.siteKey);
			if (!resultVm.ok) {
				toast.error(resultVm.error);
				return;
			}
			toast.success('Tailored profile created.');
			onOpenVariantProfile?.(resultVm.profileId);
		} finally {
			tailorBusySiteKey = null;
		}
	}

	function openDirectoryVariant(siteKey: string): void {
		const variantId = variantProfileIdsBySiteKey.get(siteKey);
		if (variantId) onOpenVariantProfile?.(variantId);
	}

	const gridContext: DirectoryChannelsGridContext = {
		productProfileId: '',
		organizationId: '',
		variantProfileIdBySiteKey: new Map(),
		openListingDetails,
		toggleSiteExpanded,
		requestRemoveCompletion,
		tailorBusySiteKey: null,
		tailorForDirectory,
		openDirectoryVariant
	};
	setContext(directoryChannelsGridContextKey, gridContext);

	$effect(() => {
		gridContext.productProfileId = productProfileId;
		gridContext.organizationId = organizationId;
		gridContext.variantProfileIdBySiteKey = variantProfileIdsBySiteKey;
		gridContext.tailorBusySiteKey = tailorBusySiteKey;
	});

	$effect(() => {
		gridTablePresenter.refreshRowsFromSiteRows(siteRows, submissionsByDestinationId);
	});

	$effect(() => {
		gridTablePresenter.refreshCatalogFromDestinations(publishedDestinations);
	});

	$effect(() => {
		gridTablePresenter.setVariantProfileIdsBySiteKey(variantProfileIdsBySiteKey);
	});

	$effect(() => {
		void productProfileId;
		filterPresenter.reset();
	});

	$effect(() => {
		const el = gridHostEl;
		if (!browser || !el) {
			gridHostWidthPx = 0;
			return;
		}
		const measure = () => {
			const next = Math.floor(el.getBoundingClientRect().width);
			if (gridHostWidthPx === 0 || Math.abs(next - gridHostWidthPx) >= 6) {
				gridHostWidthPx = next;
			}
		};
		measure();
		const observer = new ResizeObserver(() => measure());
		observer.observe(el);
		return () => observer.disconnect();
	});

	const filterActive = $derived(filterPresenter.hasAnyRule);

	const displayRowsVm = $derived.by(() => {
		const filter = createProductDirectoryChannelsGridTableFilter(filterPresenter.value);
		return gridTablePresenter.buildDisplayRows(expandedSiteKeys, filter, filterActive);
	});

	const pagedRowsVm = $derived.by(() => {
		const from = (gridPage - 1) * gridPageSize;
		const to = Math.min(from + gridPageSize, displayRowsVm.length);
		return displayRowsVm.slice(from, to);
	});

	const gridColumns = $derived(gridTablePresenter.getGridColumnsForHostWidth(gridHostWidthPx));
	const gridSizes = $derived(gridTablePresenter.getGridSizes());

	$effect(() => {
		void gridPageSize;
		gridPage = 1;
	});

	$effect(() => {
		const total = displayRowsVm.length;
		const pageCount = Math.max(1, Math.ceil(total / gridPageSize) || 1);
		if (gridPage > pageCount) {
			gridPage = pageCount;
		}
	});

	async function handleListingDetailsSubmit(values: {
		destinationId: string;
		listingUrl: string;
		listingDofollow: boolean;
		authEmail: string;
	}): Promise<void> {
		if (!listingModalRow) return;
		listingModalSubmitting = true;
		try {
			const listingUrl = values.listingUrl.trim();
			const authEmail = values.authEmail.trim();
			let savedSubmission: AutoLaunchSubmissionDto | null = null;

			if (listingModalMode === 'edit' && listingModalRow.submissionId && listingModalRow.submissionStatus === 'completed') {
				const resultVm = await autoLaunchRepository.updateSubmissionListingDetails(
					listingModalRow.submissionId,
					{
						organizationId,
						listingUrl,
						listingDofollow: values.listingDofollow,
						authEmail
					}
				);
				if (!resultVm.ok) {
					toast.error(resultVm.error);
					return;
				}
				savedSubmission = resultVm.submission;
				toast.success('Listing details updated.');
			} else {
				const resultVm = await autoLaunchRepository.recordManualSubmissionComplete({
					organizationId,
					productProfileId,
					destinationId: values.destinationId,
					listingUrl,
					listingDofollow: values.listingDofollow,
					authEmail
				});
				if (!resultVm.ok) {
					toast.error(resultVm.error);
					return;
				}
				savedSubmission = resultVm.submission;
				toast.success('Directory launch marked complete.');
			}

			listingModalOpen = false;
			listingModalRow = null;
			if (savedSubmission) {
				await onListingDetailsSaved?.(savedSubmission);
			}
		} finally {
			listingModalSubmitting = false;
		}
	}
</script>

{#if siteRows.length > 0}
	<details class="group mt-4 rounded-lg border border-base-300 bg-base-200/50" bind:open={panelOpen}>
		<summary
			class="cursor-pointer list-none select-none px-3 py-2.5 text-sm font-medium text-base-content/85 marker:content-none hover:bg-base-content/5 [&::-webkit-details-marker]:hidden"
		>
			<span class="flex items-center justify-between gap-3">
				<span class="flex min-w-0 items-center gap-2">
					<AbstractIcon
						name={icons.ChevronDown.name}
						class="size-4 shrink-0 text-base-content/55 transition-transform duration-200 group-open:rotate-180"
						width="16"
						height="16"
						aria-hidden="true"
					/>
					<span>Directory channels</span>
				</span>
				<span
					class="shrink-0 text-xs font-medium text-primary underline-offset-2 group-open:hidden"
				>
					Show
				</span>
				<span
					class="hidden shrink-0 text-xs font-medium text-primary underline-offset-2 group-open:inline"
				>
					Hide
				</span>
			</span>
		</summary>
		<div class="space-y-2 border-t border-base-300/60 px-3 pb-3 pt-2">
			<p class="text-xs text-base-content/55">
				Expand a directory site to see each launch opportunity. Status reflects submission and profile sync;
				DR and DR updated come from the Build Backlinks catalog; link type uses your listing evidence when
				complete, otherwise the catalog default.
			</p>

			<DirectoryChannelsGridLayout
				filteredRowCount={displayRowsVm.length}
				pagedRowsVm={pagedRowsVm}
				filterValue={filterPresenter.value}
				filterFields={filterPresenter.fields}
				filterHasAnyRule={filterPresenter.hasAnyRule}
				filterIsReady={filterPresenter.isReady}
				filterAddMenuOpen={filterPresenter.addFilterMenuOpen}
				filterAddableFieldOptions={filterPresenter.addableFieldOptions}
				filterOptions={filterPresenter.buildOptions(gridTablePresenter.buildAllOpportunityRows())}
				{gridColumns}
				{gridSizes}
				gridAutoRowHeight={true}
				bind:gridHostEl
				bind:gridPage
				bind:gridPageSize
				onFilterInit={(api) => filterPresenter.initFilterBuilderApi(api)}
				onFilterChange={(ev) => filterPresenter.applyChange(ev)}
				onFilterToggleAddMenu={() => filterPresenter.toggleAddFilterMenu()}
				onFilterAddField={(fieldId) => filterPresenter.addFilterForField(fieldId)}
			/>

			<p class="text-xs text-base-content/50">
				Launch progress is per product and counts each directory site once. Saved → Backlinks is only a
				site bookmark shortlist.
			</p>
		</div>
	</details>
{/if}

{#if removeCompletionRow?.submissionId}
	<ActionVerificationModal
		data={{
			submissionId: removeCompletionRow.submissionId,
			organizationId,
			opportunityLabel: `${removeCompletionRow.siteLabel} — ${removeCompletionRow.opportunityLabel}`
		}}
		bind:open={removeCompletionModalOpen}
		executionFunction={executeRemoveCompletion}
		buttonIconName={icons.CircleX.name}
		buttonText="Mark incomplete"
		modalTitle="Mark launch incomplete"
		modalDescription={`Mark "${removeCompletionRow.siteLabel} — ${removeCompletionRow.opportunityLabel}" as incomplete? Listing URL, dofollow, and auth email for this opportunity will be cleared. You can mark it complete again later.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={async () => {
			const submissionId = removeCompletionRow?.submissionId;
			removeCompletionRow = null;
			if (submissionId) {
				await onListingDetailsRemoved?.({ productProfileId, submissionId });
			}
		}}
	/>
{/if}

{#if listingModalRow}
	<DirectoryChannelListingDetailsModal
		bind:open={listingModalOpen}
		mode={listingModalMode}
		siteLabel={listingModalRow.rowKind === 'opportunity'
			? `${listingModalRow.siteLabel} — ${listingModalRow.opportunityLabel}`
			: listingModalRow.siteLabel}
		variantOptions={listingModalRow.variantOptions}
		initialDestinationId={listingModalRow.primaryDestinationId}
		initialListingUrl={listingModalRow.listUrl ?? ''}
		initialListingDofollow={listingModalRow.listingDofollow}
		initialAuthEmail={listingModalRow.authEmail ?? ''}
		{suggestedAuthEmail}
		submissionId={listingModalRow.submissionId}
		submitting={listingModalSubmitting}
		onSubmit={handleListingDetailsSubmit}
		onMarkIncomplete={listingModalRow.submissionStatus === 'completed'
			? openMarkIncompleteFromEditModal
			: undefined}
		onCancel={() => {
			listingModalOpen = false;
			listingModalRow = null;
		}}
	/>
{/if}
