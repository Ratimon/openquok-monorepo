<script lang="ts">
	import type {
		LinkDirectoryCategoryDto,
		LinkDirectoryOpportunityDto,
		LinkDirectoryOpportunityTypeDto,
		LinkDirectorySiteDto,
		LinkDirectoryTagDto
	} from '$lib/link-directory/link-directory.types';
	import type { DatabaseName } from '$lib/core/Image.repository.svelte';

	import { isBuildBacklinksEditorialTagSlug } from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
	import { linkDirectorySiteFormSchema } from '$lib/link-directory/link-directory-admin.types';
	import { linkDirectoryRepository } from '$lib/link-directory/index';
	import { resolveLinkDirectoryManualMetricsOnSave } from '$lib/link-directory/utils/resolveLinkDirectoryManualMetricsOnSave';
	import {
		buildLinkDirectoryLogoPublicUrl,
		resolveLinkDirectoryLogoStorageKey
	} from '$lib/link-directory/utils/linkDirectoryLogoImages';
	import {
		shouldSyncSlugFromTitle,
		slugFromTitle
	} from '$lib/link-directory/utils/linkDirectoryAdminSlugSync';
	import { listAvailablePublicChannels } from '$lib/content/constants/channels';
	import { imageRepository } from '$lib/core/index';
	import { DeleteImagePresenter } from '$lib/core/DeleteImage.presenter.svelte';
	import { DownloadImagePresenter } from '$lib/core/DownloadImage.presenter.svelte';
	import { SupabaseImageUploadAreaPresenter } from '$lib/core/SupabaseImageUploadArea.presenter.svelte';
	import { UploadImagePresenter } from '$lib/core/UploadImage.presenter.svelte';

	const siteSortOrderHint =
		'Default 0. The public Build Backlinks hub sorts by domain rating (high first), not this field. Use a positive number only to reserve editor order for a promoted listing (lower = earlier when editor-order sort ships). Opportunity order on each site uses per-opportunity sort values (10, 20, 30…).';

	import { goto } from '$app/navigation';
	import { toast } from '$lib/ui/sonner';
	import { getRootPathSecretAdminLinkDirectoryManagerSiteEditor } from '$lib/area-admin/constants/getRootPathSecretAdminArea';
	import { getRootPathPublicBuildBacklinksSite } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';
	import { route, url } from '$lib/utils/path';

	import Button from '$lib/ui/buttons/Button.svelte';
	import ProviderHttpUrlInput from '$lib/ui/components/posts/providers/ProviderHttpUrlInput.svelte';
	import { Textarea } from '$lib/ui/textarea';
	import { Input } from '$lib/ui/input';

	import LinkDirectoryMetricsAdminNotice from '$lib/ui/components/link-directory-manager/LinkDirectoryMetricsAdminNotice.svelte';
	import LinkDirectoryOpenQuokChannelSelect from '$lib/ui/components/link-directory-manager/LinkDirectoryOpenQuokChannelSelect.svelte';
	import LinkDirectoryOpportunityUpsertModal from '$lib/ui/components/link-directory-manager/LinkDirectoryOpportunityUpsertModal.svelte';
	import SupabaseImageUploadArea from '$lib/ui/supabase/SupabaseImageUploadArea.svelte';

	type Props = {
		site: LinkDirectorySiteDto | null;
		categories: LinkDirectoryCategoryDto[];
		tags: LinkDirectoryTagDto[];
		opportunityTypes: LinkDirectoryOpportunityTypeDto[];
		userId: string;
		onSiteSaved?: (site: LinkDirectorySiteDto) => void | Promise<void>;
		onOpportunityChange?: () => void | Promise<void>;
	};

	let {
		site,
		categories,
		tags,
		opportunityTypes,
		userId,
		onSiteSaved,
		onOpportunityChange
	}: Props = $props();

	const logoImagePresenter = new SupabaseImageUploadAreaPresenter(
		new DownloadImagePresenter(imageRepository),
		new UploadImagePresenter(imageRepository),
		new DeleteImagePresenter(imageRepository)
	);

	let logoUploadRef: SupabaseImageUploadArea | undefined = $state();

	let submitting = $state(false);
	let slugManuallyEdited = $state(false);
	let openquokChannelHintApplied = $state(false);
	let slug = $state('');
	let title = $state('');
	let siteUrl = $state('');
	let logoStorageKey = $state('');
	let logoExternalUrl = $state('');
	let shortDescription = $state('');
	let longDescription = $state('');
	let domainRating = $state('');
	let domainAuthority = $state('');
	let monthlyVisits = $state('');
	let metricsSource = $state('');
	let categoryId = $state('');
	let openquokChannelSlug = $state('');
	let isOpenquokAuthSupported = $state(false);
	let isAdminPublished = $state(false);
	let sortOrder = $state('0');
	let selectedTagIds = $state<string[]>([]);
	let opportunities = $state<LinkDirectoryOpportunityDto[]>([]);

	const editorialTags = $derived(tags.filter((tag) => isBuildBacklinksEditorialTagSlug(tag.slug)));

	const publicSiteGuidePath = $derived(
		slug.trim() ? route(getRootPathPublicBuildBacklinksSite(slug.trim())) : ''
	);

	$effect(() => {
		slugManuallyEdited = Boolean(site?.id);
		openquokChannelHintApplied = Boolean(site?.id);
		slug = site?.slug ?? '';
		title = site?.title ?? '';
		siteUrl = site?.siteUrl ?? '';
		hydrateLogoFieldsFromUrl(site?.logoUrl ?? '');
		shortDescription = site?.shortDescription ?? '';
		longDescription = site?.longDescription ?? '';
		domainRating = site?.domainRating != null ? String(site.domainRating) : '';
		domainAuthority = site?.domainAuthority != null ? String(site.domainAuthority) : '';
		monthlyVisits = site?.monthlyVisits != null ? String(site.monthlyVisits) : '';
		metricsSource = site?.metricsSource ?? '';
		categoryId = site?.categoryId ?? '';
		openquokChannelSlug = site?.openquokChannelSlug ?? '';
		isOpenquokAuthSupported = site?.isOpenquokAuthSupported ?? false;
		isAdminPublished = site?.isAdminPublished ?? false;
		sortOrder = String(site?.sortOrder ?? 0);
		selectedTagIds =
			site?.tagSlugs?.map((slugValue) => tags.find((t) => t.slug === slugValue)?.id).filter(Boolean) as string[] ??
			[];
		opportunities = site?.opportunities ?? [];
	});

	$effect(() => {
		if (!shouldSyncSlugFromTitle({ slug, title, slugManuallyEdited })) {
			return;
		}
		const nextSlug = slugFromTitle(title);
		if (nextSlug !== slug) {
			slug = nextSlug;
		}
	});

	$effect(() => {
		if (site?.id || openquokChannelHintApplied || openquokChannelSlug.trim()) {
			return;
		}
		const candidate = slugFromTitle(title);
		if (!candidate) {
			return;
		}
		const matchesChannel = listAvailablePublicChannels().some((channel) => channel.slug === candidate);
		if (matchesChannel) {
			openquokChannelSlug = candidate;
			openquokChannelHintApplied = true;
			isOpenquokAuthSupported = true;
		}
	});

	function hydrateLogoFieldsFromUrl(raw: string) {
		const trimmed = raw.trim();
		const storageKey = trimmed ? resolveLinkDirectoryLogoStorageKey(trimmed) : null;
		if (storageKey) {
			logoStorageKey = storageKey;
			logoExternalUrl = '';
			return;
		}
		logoStorageKey = '';
		logoExternalUrl = trimmed;
	}

	function onSlugFieldInput() {
		slugManuallyEdited = true;
	}

	function normalizeSiteUrlOnBlur() {
		const trimmed = siteUrl.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== siteUrl) siteUrl = normalized;
	}

	function normalizeLogoExternalUrlOnBlur() {
		const trimmed = logoExternalUrl.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== logoExternalUrl) logoExternalUrl = normalized;
	}

	function onLogoStorageKeyChange(nextKey: string) {
		logoStorageKey = nextKey;
		if (nextKey.trim()) {
			logoExternalUrl = '';
		}
	}

	function onLogoExternalUrlInput() {
		if (logoExternalUrl.trim()) {
			logoStorageKey = '';
			logoUploadRef?.clearPendingLocalFile?.();
			logoImagePresenter.reset();
		}
	}

	const handleLoadLogoImage = async (databaseName: DatabaseName, imageUrl: string) => {
		return logoImagePresenter.loadImage(databaseName, imageUrl);
	};

	const handleUploadLogoImage = async (databaseName: DatabaseName, imageFile: File, uid: string) => {
		return logoImagePresenter.uploadImage(databaseName, imageFile, uid);
	};

	const deletePreviousLogoInStorage = async (databaseName: DatabaseName, imagePath: string) => {
		const result = await imageRepository.deleteImage(databaseName, imagePath);
		if (!result.success) {
			throw new Error(result.message);
		}
	};

	async function resolveLogoUrlForSave(): Promise<string | null | false> {
		if (logoUploadRef?.hasSelectedFile?.()) {
			if (!userId.trim()) {
				toast.error('You must be signed in to upload a site logo.');
				return false;
			}
			const uploadedPath = await logoUploadRef.uploadSelectedImage();
			if (uploadedPath === false) {
				return false;
			}
			logoStorageKey = uploadedPath;
			return buildLinkDirectoryLogoPublicUrl(uploadedPath);
		}

		const external = normalizeHttpUrlInputIfLikely(logoExternalUrl.trim());
		if (external) {
			if (external !== logoExternalUrl) logoExternalUrl = external;
			return external;
		}

		if (logoStorageKey.trim()) {
			return buildLinkDirectoryLogoPublicUrl(logoStorageKey);
		}

		return null;
	}

	function handleOpenQuokChannelChange(next: string) {
		if (next.trim()) {
			isOpenquokAuthSupported = true;
		}
	}

	function toggleTag(tagId: string) {
		if (selectedTagIds.includes(tagId)) {
			selectedTagIds = selectedTagIds.filter((id) => id !== tagId);
		} else {
			selectedTagIds = [...selectedTagIds, tagId];
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const dr = domainRating.trim() ? Number.parseInt(domainRating, 10) : null;
		const da = domainAuthority.trim() ? Number.parseInt(domainAuthority, 10) : null;
		const visits = monthlyVisits.trim() ? Number.parseInt(monthlyVisits, 10) : null;
		const parsedDr = Number.isFinite(dr) ? dr : null;
		const parsedDa = Number.isFinite(da) ? da : null;
		const parsedVisits = Number.isFinite(visits) ? visits : null;
		const metricsPatch = resolveLinkDirectoryManualMetricsOnSave(site, {
			domainRating: parsedDr,
			domainAuthority: parsedDa,
			monthlyVisits: parsedVisits,
			metricsSource: metricsSource.trim() || null
		});
		const resolvedSlug = slug.trim() || slugFromTitle(title.trim());
		const normalizedSiteUrl = normalizeHttpUrlInputIfLikely(siteUrl.trim());
		if (normalizedSiteUrl !== siteUrl) siteUrl = normalizedSiteUrl;
		const resolvedLogoUrl = await resolveLogoUrlForSave();
		if (resolvedLogoUrl === false) {
			return;
		}
		const payload = {
			...(site?.id ? { id: site.id } : {}),
			slug: resolvedSlug,
			title: title.trim(),
			site_url: normalizedSiteUrl,
			logo_url: resolvedLogoUrl,
			short_description: shortDescription.trim() || null,
			long_description: longDescription.trim() || null,
			domain_rating: parsedDr,
			domain_authority: parsedDa,
			monthly_visits: parsedVisits,
			...metricsPatch,
			category_id: categoryId || null,
			openquok_channel_slug: openquokChannelSlug.trim() || null,
			is_openquok_auth_supported: isOpenquokAuthSupported,
			is_admin_published: isAdminPublished,
			sort_order: Number.parseInt(sortOrder, 10) || 0,
			tagIds: selectedTagIds
		};
		const result = linkDirectorySiteFormSchema.safeParse(payload);
		if (!result.success) {
			toast.error(result.error.issues.map((i) => i.message).join(' '));
			return;
		}
		submitting = true;
		try {
			const upsertResult = site?.id
				? await linkDirectoryRepository.updateSite(site.id, result.data)
				: await linkDirectoryRepository.createSite(result.data);
			if (!upsertResult.ok || !upsertResult.id) {
				toast.error(upsertResult.error ?? 'Failed to save site.');
				return;
			}
			toast.success(site?.id ? 'Site updated.' : 'Site created.');
			const refreshed = await linkDirectoryRepository.getSiteById(upsertResult.id);
			if (refreshed) {
				opportunities = refreshed.opportunities;
				await onSiteSaved?.(refreshed);
				if (!site?.id) {
					await goto(url(getRootPathSecretAdminLinkDirectoryManagerSiteEditor(upsertResult.id)));
				}
			}
		} finally {
			submitting = false;
		}
	}

	async function handleOpportunitySaved(opportunity: LinkDirectoryOpportunityDto) {
		const index = opportunities.findIndex((o) => o.id === opportunity.id);
		opportunities =
			index < 0
				? [...opportunities, opportunity]
				: [...opportunities.slice(0, index), opportunity, ...opportunities.slice(index + 1)];
		await onOpportunityChange?.();
	}

	async function deleteOpportunity(opportunityId: string) {
		const result = await linkDirectoryRepository.deleteOpportunity(opportunityId);
		if (!result.ok) {
			toast.error(result.error ?? 'Failed to delete opportunity.');
			return;
		}
		opportunities = opportunities.filter((o) => o.id !== opportunityId);
		await onOpportunityChange?.();
	}
</script>

<form class="space-y-6" onsubmit={handleSubmit}>
	<div class="grid gap-4 md:grid-cols-2">
		<label class="form-control">
			<span class="label-text text-sm">Title</span>
			<Input bind:value={title} required />
		</label>
		<label class="form-control">
			<span class="label-text text-sm">Slug</span>
			{#if site?.id}
				<Input value={slug} disabled class="font-mono" />
				<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
					Read-only after publish — changing the slug would break existing /build-backlinks/ links.
					{#if publicSiteGuidePath}
						<span class="mt-1 block font-mono text-xs text-base-content/80">{publicSiteGuidePath}</span>
					{/if}
				</span>
			{:else}
				<Input bind:value={slug} required oninput={onSlugFieldInput} />
				<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
					Public site guide URL segment under /build-backlinks/. Auto-filled from title until you edit it.
					{#if publicSiteGuidePath}
						<span class="mt-1 block font-mono text-xs text-base-content/80">{publicSiteGuidePath}</span>
					{/if}
				</span>
			{/if}
		</label>
		<div class="form-control md:col-span-2">
			<span class="label-text text-sm">Site URL</span>
			<ProviderHttpUrlInput
				id="link-directory-site-url"
				bind:value={siteUrl}
				placeholder="example.com or https://example.com"
				required
				onblur={normalizeSiteUrlOnBlur}
			/>
			<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
				Adds https:// on blur or save when the value looks like a URL. Pasted https:// links are left unchanged.
			</span>
		</div>
		<div class="form-control md:col-span-2 space-y-3">
			<span class="label-text text-sm">Site logo</span>
			<p class="text-xs text-base-content/70">
				Upload a square logo (shown at 56×56 on the Build Backlinks hub). Saved as a public URL in the catalog.
			</p>
			<SupabaseImageUploadArea
				bind:this={logoUploadRef}
				duid={userId}
				url={logoStorageKey}
				width={128}
				height={128}
				aspectRatio="1/1"
				databaseName="link_directory_logos"
				deletePreviousStorage={deletePreviousLogoInStorage}
				resetOnDestroy={false}
				onFormTouch={onLogoStorageKeyChange}
				uploadAreaVm={logoImagePresenter.uploadAreaVm}
				onLoadImage={handleLoadLogoImage}
				onUploadImage={handleUploadLogoImage}
				onToastMessageChange={(show) => (logoImagePresenter.uploadAreaVm.showToastMessage = show)}
				onReset={() => logoImagePresenter.reset()}
			/>
			<div class="flex items-center gap-3">
				<div class="bg-base-300 h-px flex-1"></div>
				<span class="text-base-content/50 text-xs">or paste external logo URL</span>
				<div class="bg-base-300 h-px flex-1"></div>
			</div>
			<label class="form-control">
				<span class="label-text text-sm">External logo URL</span>
				<ProviderHttpUrlInput
					id="link-directory-external-logo-url"
					bind:value={logoExternalUrl}
					placeholder="https://…"
					oninput={onLogoExternalUrlInput}
					onblur={normalizeLogoExternalUrlOnBlur}
				/>
			</label>
		</div>
		<label class="form-control md:col-span-2">
			<span class="label-text text-sm">Sort order (catalog promotion)</span>
			<Input type="number" min="0" bind:value={sortOrder} />
			<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
				{siteSortOrderHint}
			</span>
		</label>
		<label class="form-control">
			<span class="label-text text-sm">Category</span>
			<select class="select select-bordered w-full" bind:value={categoryId}>
				<option value="">— None —</option>
				{#each categories as category (category.id)}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
		</label>
		<LinkDirectoryOpenQuokChannelSelect
			label="OpenQuok channel"
			bind:value={openquokChannelSlug}
			onValueChange={handleOpenQuokChannelChange}
		/>
	</div>

	<section class="space-y-4 rounded-xl border border-base-300/80 p-4">
		<LinkDirectoryMetricsAdminNotice
			metricsUpdatedAt={site?.metricsUpdatedAt}
			metricsSource={site?.metricsSource}
		/>
		<div class="grid gap-4 md:grid-cols-3">
			<label class="form-control">
				<span class="label-text text-sm">Domain rating</span>
				<Input type="number" min="0" max="100" bind:value={domainRating} />
			</label>
			<label class="form-control">
				<span class="label-text text-sm">Domain authority</span>
				<Input type="number" min="0" max="100" bind:value={domainAuthority} />
			</label>
			<label class="form-control">
				<span class="label-text text-sm">Monthly visits</span>
				<Input type="number" min="0" bind:value={monthlyVisits} />
			</label>
			<label class="form-control md:col-span-3">
				<span class="label-text text-sm">Metrics source (internal note)</span>
				<Input
					bind:value={metricsSource}
					placeholder="e.g. Ahrefs export, 2026-03-15"
				/>
			</label>
		</div>
	</section>

	<label class="form-control">
		<span class="label-text text-sm">Short description</span>
		<Textarea bind:value={shortDescription} rows={2} />
	</label>
	<label class="form-control">
		<span class="label-text text-sm">Long description (markdown)</span>
		<Textarea bind:value={longDescription} rows={6} />
	</label>

	{#if editorialTags.length > 0}
		<div>
			<p class="text-sm font-medium mb-1">Editorial tags</p>
			<p class="text-xs text-base-content/60 mb-2">
				Dofollow, cost, approval, and link type browse come from each opportunity — not from tags.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each editorialTags as tag (tag.id)}
					<label class="flex items-center gap-1 text-sm border border-base-300 rounded-lg px-2 py-1">
						<input
							type="checkbox"
							class="checkbox checkbox-xs"
							checked={selectedTagIds.includes(tag.id)}
							onchange={() => toggleTag(tag.id)}
						/>
						{tag.name}
					</label>
				{/each}
			</div>
		</div>
	{/if}

	<div class="flex flex-wrap gap-4">
		<label class="form-control max-w-md">
			<span class="flex items-center gap-2 text-sm">
				<input type="checkbox" class="checkbox checkbox-sm" bind:checked={isOpenquokAuthSupported} />
				OpenQuok auth supported
			</span>
			<span class="label-text-alt mt-1 block text-left leading-snug text-base-content/70">
				Users can connect this network in OpenQuok workspace.
			</span>
		</label>
		<label class="flex items-center gap-2 text-sm">
			<input type="checkbox" class="checkbox checkbox-sm" bind:checked={isAdminPublished} />
			Admin published
		</label>
	</div>

	<Button type="submit" variant="primary" disabled={submitting}>
		{submitting ? 'Saving…' : site?.id ? 'Save site' : 'Create site'}
	</Button>
</form>

{#if site?.id}
	<section class="mt-10 border-t border-base-300 pt-8">
		<div class="flex items-center justify-between gap-4 mb-4">
			<h2 class="text-lg font-semibold">Opportunities</h2>
			<LinkDirectoryOpportunityUpsertModal
				siteId={site.id}
				{opportunityTypes}
				existingOpportunities={opportunities}
				onSaved={handleOpportunitySaved}
			/>
		</div>
		{#if opportunities.length === 0}
			<p class="text-sm text-base-content/70">No opportunities yet. Add one to describe how users earn links on this site.</p>
		{:else}
			<ul class="space-y-3">
				{#each opportunities as opportunity (opportunity.id)}
					<li class="border border-base-300 rounded-xl p-4 flex flex-wrap items-start justify-between gap-3">
						<div>
							<p class="font-medium">{opportunity.title}</p>
							<p class="text-xs font-mono text-base-content/60">{opportunity.slug}</p>
							<p class="text-sm text-base-content/70 mt-1">
								{opportunity.opportunityType?.label ?? 'Type'} · {opportunity.effort} · {opportunity.costTier}
							</p>
						</div>
						<div class="flex gap-2">
							<LinkDirectoryOpportunityUpsertModal
								siteId={site.id}
								{opportunity}
								{opportunityTypes}
								existingOpportunities={opportunities}
								onSaved={handleOpportunitySaved}
							/>
							<Button variant="ghost" size="sm" onclick={() => deleteOpportunity(opportunity.id)}>Delete</Button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
{/if}
