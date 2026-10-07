<script lang="ts">
	import type {
		LinkDirectoryCtaKind,
		LinkDirectoryOpportunityDto,
		LinkDirectoryOpportunityStepDto,
		LinkDirectoryOpportunityTypeDto
	} from '$lib/link-directory/link-directory.types';
	import { linkDirectoryOpportunityFormSchema } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';
	import { defaultLinkDirectoryOpportunitySortOrder } from '$lib/link-directory/utils/defaultLinkDirectoryOpportunitySortOrder';
	import {
		shouldSyncSlugFromTitle,
		slugFromTitle
	} from '$lib/link-directory/utils/linkDirectoryAdminSlugSync';
	import {
		normalizeLinkDirectoryOpportunityStepsForSave,
		sortLinkDirectoryOpportunitySteps
	} from '$lib/link-directory/utils/normalizeLinkDirectoryOpportunityStepsForSave';

	import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';
	import { toast } from '$lib/ui/sonner';

	import Button from '$lib/ui/buttons/Button.svelte';
	import ProviderHttpUrlInput from '$lib/ui/components/posts/providers/ProviderHttpUrlInput.svelte';
	import LinkDirectoryRichHtmlField from '$lib/ui/components/link-directory-manager/LinkDirectoryRichHtmlField.svelte';
	import { Input } from '$lib/ui/input';
	import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '$lib/ui/dialog';

	import LinkDirectoryOpenQuokChannelSelect from '$lib/ui/components/link-directory-manager/LinkDirectoryOpenQuokChannelSelect.svelte';
	import LinkDirectoryOpportunityStepsEditor from '$lib/ui/components/link-directory-manager/LinkDirectoryOpportunityStepsEditor.svelte';

	const opportunitySortOrderHint =
		'Playbook order on site guide (10, 20, 30…).';

	type Props = {
		siteId: string;
		userId: string;
		opportunity?: LinkDirectoryOpportunityDto;
		opportunityTypes: LinkDirectoryOpportunityTypeDto[];
		existingOpportunities?: LinkDirectoryOpportunityDto[];
		onSaved: (opportunity: LinkDirectoryOpportunityDto) => void | Promise<void>;
	};

	let {
		siteId,
		userId,
		opportunity,
		opportunityTypes,
		existingOpportunities = [],
		onSaved
	}: Props = $props();

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let slugManuallyEdited = $state(false);

	let slug = $state('');
	let title = $state('');
	let opportunityTypeId = $state('');
	let effort = $state('medium');
	let approvalMode = $state('manual_review');
	let dofollow = $state('unknown');
	let costTier = $state('free');
	let description = $state('');
	let isPublished = $state(true);
	let sortOrder = $state(10);
	let openquokCtaKind = $state<LinkDirectoryCtaKind>('none');
	let openquokChannelSlug = $state('');
	let openquokPlugName = $state('');
	let ctaHref = $state('');
	let ctaLabel = $state('');
	let playbookSteps = $state<LinkDirectoryOpportunityStepDto[]>([]);
	/** Bumps when the dialog opens so the steps editor remounts after sync hydrate. */
	let stepsEditorSession = $state(0);

	const showExternalLinkFields = $derived(
		openquokCtaKind === 'none' || openquokCtaKind === 'external_doc'
	);
	const showChannelSelect = $derived(
		openquokCtaKind === 'connect_channel' || openquokCtaKind === 'schedule_post'
	);
	const showPlugName = $derived(openquokCtaKind === 'use_plug');
	const externalHrefRequired = $derived(openquokCtaKind === 'external_doc');

	function hydrateFormFromOpportunity() {
		const isEdit = Boolean(opportunity?.id);
		slugManuallyEdited = isEdit;
		slug = opportunity?.slug ?? '';
		title = opportunity?.title ?? '';
		opportunityTypeId = opportunity?.opportunityTypeId ?? opportunityTypes[0]?.id ?? '';
		effort = opportunity?.effort ?? 'medium';
		approvalMode = opportunity?.approvalMode ?? 'manual_review';
		dofollow = opportunity?.dofollow ?? 'unknown';
		costTier = opportunity?.costTier ?? 'free';
		description = opportunity?.description ?? '';
		isPublished = opportunity?.isAdminPublished ?? true;
		openquokCtaKind = opportunity?.openquokCtaKind ?? 'none';
		openquokChannelSlug = opportunity?.openquokChannelSlug ?? '';
		openquokPlugName = opportunity?.openquokPlugName ?? '';
		ctaHref = opportunity?.ctaHref ?? '';
		ctaLabel = opportunity?.ctaLabel ?? '';
		sortOrder = isEdit
			? (opportunity?.sortOrder ?? 10)
			: defaultLinkDirectoryOpportunitySortOrder(existingOpportunities);
		playbookSteps = sortLinkDirectoryOpportunitySteps(opportunity?.steps);
	}

	function openDialog() {
		hydrateFormFromOpportunity();
		stepsEditorSession += 1;
		dialogOpen = true;
	}

	$effect(() => {
		if (!dialogOpen) {
			return;
		}
		if (!shouldSyncSlugFromTitle({ slug, title, slugManuallyEdited })) {
			return;
		}
		const nextSlug = slugFromTitle(title);
		if (nextSlug !== slug) {
			slug = nextSlug;
		}
	});

	function onSlugFieldInput() {
		slugManuallyEdited = true;
	}

	function normalizeCtaHrefOnBlur() {
		const trimmed = ctaHref.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== ctaHref) ctaHref = normalized;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const resolvedSlug = slug.trim() || slugFromTitle(title.trim());
		const parsedSortOrder = Number(sortOrder);
		const normalizedCtaHref = normalizeHttpUrlInputIfLikely(ctaHref.trim());
		if (normalizedCtaHref !== ctaHref) ctaHref = normalizedCtaHref;
		const normalizedSteps = normalizeLinkDirectoryOpportunityStepsForSave(playbookSteps);
		const payload = {
			...(opportunity?.id ? { id: opportunity.id } : {}),
			slug: resolvedSlug,
			title: title.trim(),
			opportunity_type_id: opportunityTypeId,
			effort,
			approval_mode: approvalMode,
			dofollow,
			cost_tier: costTier,
			description: description.trim() || null,
			is_admin_published: isPublished,
			sort_order: Number.isFinite(parsedSortOrder) ? Math.trunc(parsedSortOrder) : 0,
			steps: normalizedSteps,
			openquok_cta_kind: openquokCtaKind,
			openquok_channel_slug: openquokChannelSlug.trim() || null,
			openquok_plug_name: openquokPlugName.trim() || null,
			cta_href: normalizedCtaHref || null,
			cta_label: ctaLabel.trim() || null
		};
		const result = linkDirectoryOpportunityFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}
		submitting = true;
		try {
			const upsertResult = opportunity?.id
				? await linkDirectoryRepository.updateOpportunity(opportunity.id, result.data)
				: await linkDirectoryRepository.createOpportunity(siteId, result.data);
			if (!upsertResult.ok || !upsertResult.id) {
				toast.error(upsertResult.error ?? 'Failed to save opportunity.');
				return;
			}
			const type = opportunityTypes.find((t) => t.id === opportunityTypeId) ?? null;
			const vm: LinkDirectoryOpportunityDto = {
				id: upsertResult.id,
				siteId,
				slug: result.data.slug,
				title: result.data.title,
				opportunityTypeId,
				opportunityType: type,
				effort: result.data.effort ?? 'medium',
				approvalMode: result.data.approval_mode ?? 'manual_review',
				approvalTimeHint: opportunity?.approvalTimeHint ?? null,
				dofollow: result.data.dofollow ?? 'unknown',
				costTier: result.data.cost_tier ?? 'free',
				costNote: opportunity?.costNote ?? null,
				description: result.data.description ?? null,
				steps: result.data.steps ?? [],
				openquokCtaKind: result.data.openquok_cta_kind ?? 'none',
				openquokChannelSlug: result.data.openquok_channel_slug ?? null,
				openquokPlugName: result.data.openquok_plug_name ?? null,
				ctaHref: result.data.cta_href ?? null,
				ctaLabel: result.data.cta_label ?? null,
				sortOrder: result.data.sort_order ?? 0,
				isAdminPublished: result.data.is_admin_published ?? true,
				publishedAt: opportunity?.publishedAt ?? null
			};
			await onSaved(vm);
			dialogOpen = false;
			toast.success(opportunity?.id ? 'Opportunity updated.' : 'Opportunity created.');
		} finally {
			submitting = false;
		}
	}
</script>

<Button variant={opportunity ? 'ghost' : 'outline'} size="sm" onclick={openDialog}>
	{opportunity ? 'Edit' : 'Add opportunity'}
</Button>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-w-xl max-h-[90vh] overflow-y-auto">
		<DialogHeader>
			<DialogTitle>{opportunity ? 'Edit opportunity' : 'New opportunity'}</DialogTitle>
		</DialogHeader>
		<form class="space-y-3" onsubmit={handleSubmit}>
			<label class="form-control w-full">
				<span class="label-text text-sm">Title</span>
				<Input bind:value={title} required />
			</label>
			<label class="form-control w-full">
				<span class="label-text text-sm">Slug (per site)</span>
				{#if opportunity?.id}
					<Input value={slug} disabled class="font-mono" />
					<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
						Read-only after publish — changing the slug would break in-page opportunity anchors on the site
						guide.
					</span>
				{:else}
					<Input bind:value={slug} required oninput={onSlugFieldInput} />
				{/if}
			</label>
			<label class="form-control w-full">
				<span class="label-text text-sm">Type</span>
				<select class="select select-bordered w-full" bind:value={opportunityTypeId} required>
					{#each opportunityTypes as type (type.id)}
						<option value={type.id}>{type.label}</option>
					{/each}
				</select>
			</label>
			<label class="form-control w-full max-w-xs">
				<span class="label-text text-sm">Sort order</span>
				<Input type="number" bind:value={sortOrder} min={0} step={1} required />
				<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
					{opportunitySortOrderHint}
				</span>
			</label>
			<div class="grid grid-cols-2 gap-3">
				<label class="form-control">
					<span class="label-text text-sm">Effort</span>
					<select class="select select-bordered w-full" bind:value={effort}>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
				</label>
				<label class="form-control">
					<span class="label-text text-sm">Approval</span>
					<select class="select select-bordered w-full" bind:value={approvalMode}>
						<option value="instant">Instant</option>
						<option value="manual_review">Manual review</option>
					</select>
				</label>
				<label class="form-control">
					<span class="label-text text-sm">Dofollow</span>
					<select class="select select-bordered w-full" bind:value={dofollow}>
						<option value="dofollow">Dofollow</option>
						<option value="nofollow">Nofollow</option>
						<option value="unknown">Unknown</option>
					</select>
				</label>
				<label class="form-control">
					<span class="label-text text-sm">Cost</span>
					<select class="select select-bordered w-full" bind:value={costTier}>
						<option value="free">Free</option>
						<option value="freemium">Freemium</option>
						<option value="paid">Paid</option>
					</select>
				</label>
			</div>
			<LinkDirectoryRichHtmlField
				label="Description"
				bind:value={description}
				rows={5}
				visualEditor={true}
				{userId}
			/>

			{#if dialogOpen}
				{#key `${opportunity?.id ?? 'new'}-${stepsEditorSession}`}
					<LinkDirectoryOpportunityStepsEditor
						initialSteps={playbookSteps}
						{userId}
						onChange={(next) => {
							playbookSteps = next;
						}}
					/>
				{/key}
			{/if}

			<fieldset class="space-y-3 rounded-xl border border-base-300 p-4">
				<legend class="px-1 text-sm font-medium">OpenQuok CTA (site guide row)</legend>
				<label class="form-control w-full">
					<span class="label-text text-sm">CTA kind</span>
					<select class="select select-bordered w-full" bind:value={openquokCtaKind}>
						<option value="none">None — optional external link only</option>
						<option value="connect_channel">Connect channel</option>
						<option value="schedule_post">Schedule post (workspace)</option>
						<option value="use_plug">Use plug</option>
						<option value="external_doc">External setup guide</option>
					</select>
				</label>
				{#if showChannelSelect}
					<LinkDirectoryOpenQuokChannelSelect
						label="OpenQuok channel"
						bind:value={openquokChannelSlug}
					/>
				{/if}
				{#if showPlugName}
					<label class="form-control w-full">
						<span class="label-text text-sm">Plug name</span>
						<Input bind:value={openquokPlugName} placeholder="e.g. my-global-plug" />
					</label>
				{/if}
				{#if showExternalLinkFields}
					<label class="form-control w-full">
						<span class="label-text text-sm">
							{externalHrefRequired ? 'Setup guide URL' : 'External link URL (optional)'}
						</span>
						<ProviderHttpUrlInput
							id="link-directory-opportunity-cta-href"
							bind:value={ctaHref}
							placeholder="example.com or https://…"
							required={externalHrefRequired}
							onblur={normalizeCtaHrefOnBlur}
						/>
					</label>
				{/if}
				<label class="form-control w-full">
					<span class="label-text text-sm">Button label (optional)</span>
					<Input bind:value={ctaLabel} placeholder="Leave blank for default label" />
				</label>
			</fieldset>

			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={isPublished} />
				Admin published
			</label>
			<DialogFooter>
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button type="submit" variant="primary" disabled={submitting}>Save</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
