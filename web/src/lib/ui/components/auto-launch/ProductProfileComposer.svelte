<script lang="ts">
	import type { AutoLaunchProductProfileDto } from '$lib/auto-launch/auto-launch.types';
	import type {
		AutoLaunchProductProfileFormValues,
		BusinessProfileDataFormInput,
		BusinessProfileDataFormValues
	} from '$lib/auto-launch/auto-launch.types';

	import { autoLaunchProductProfileFormSchema } from '$lib/auto-launch';
	import { parseBusinessProfileFormIssues } from '$lib/auto-launch/businessProfileFormValidation';
	import { BUSINESS_PROFILE_MAX_TAGS, BUSINESS_PROFILE_PRICING_TYPES } from 'openquok-common';
	import { BUSINESS_PROFILE_INCLUDED_ASSET_OPTIONS } from '$lib/auto-launch/utils/businessProfileIncludedAssetLabels';
	import { suggestBusinessProfileSlug } from '$lib/auto-launch/utils/suggestBusinessProfileSlug';
	import { icons } from '$data/icons';
	import { toast } from '$lib/ui/sonner';
	import { cn } from '$lib/ui/helpers/common';

	import * as Dialog from '$lib/ui/dialog';
	import * as Tabs from '$lib/ui/tabs';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import RichHtmlField from '$lib/ui/components/rich-text/RichHtmlField.svelte';
	import BusinessProfileGalleryUpload from '$lib/ui/components/auto-launch/BusinessProfileGalleryUpload.svelte';
	import BusinessProfileLogoUpload from '$lib/ui/components/auto-launch/BusinessProfileLogoUpload.svelte';
	import { Switch } from '$lib/ui/switch';
	import { Checkbox } from '$lib/ui/checkbox';
	import ProviderHttpUrlInput from '$lib/ui/components/posts/providers/ProviderHttpUrlInput.svelte';
	import { normalizeHttpUrlInputIfLikely } from '$lib/utils/normalizeHttpUrlInput';

	type ComposerTab = 'general' | 'media' | 'socials' | 'sell';

	type SubmitValues = AutoLaunchProductProfileFormValues;

	type Props = {
		open?: boolean;
		organizationId?: string | null;
		initial?: Partial<AutoLaunchProductProfileDto> | null;
		submitting?: boolean;
		title?: string;
		onSubmit: (values: SubmitValues) => void | Promise<void>;
		onCancel?: () => void;
	};

	let {
		open = $bindable(false),
		organizationId = null,
		initial = null,
		submitting = false,
		title = 'Product profile',
		onSubmit,
		onCancel
	}: Props = $props();

	const tabTriggerClass =
		'h-auto min-h-0 flex-1 rounded-lg border-0 !border-b-0 bg-transparent px-3 py-2 text-sm font-semibold text-base-content/75 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none [&.tab-active]:bg-primary [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';

	const COMMON_CATEGORIES = [
		'AI',
		'Developer Tools',
		'Productivity',
		'Marketing',
		'SaaS',
		'Design',
		'Analytics',
		'Other'
	];

	let activeTab = $state<ComposerTab>('general');
	let formFieldErrors = $state<Record<string, string>>({});

	function fieldErr(key: string): string | undefined {
		return formFieldErrors[key];
	}

	function fieldInvalid(key: string): boolean {
		return Boolean(fieldErr(key));
	}

	function inputClasses(key: string, base = 'input input-bordered w-full'): string {
		return cn(base, fieldInvalid(key) && 'input-error');
	}

	let name = $state('');
	let tagline = $state('');
	let description = $state('');
	let websiteUrl = $state('');
	let logoUrl = $state<string | null>(null);

	let category = $state('');
	let pricingType = $state<(typeof BUSINESS_PROFILE_PRICING_TYPES)[number] | ''>('');
	let tags = $state<string[]>([]);
	let tagInput = $state('');
	let isOpenSource = $state(false);
	let repositoryUrl = $state('');
	let launchVideoUrl = $state('');
	let galleryUrls = $state<string[]>([]);

	let socialX = $state('');
	let socialGithub = $state('');
	let socialInstagram = $state('');
	let socialLinkedin = $state('');
	let socialTiktok = $state('');
	let socialFacebook = $state('');
	let socialYoutube = $state('');
	let socialBluesky = $state('');

	let acquisitionListed = $state(false);
	let askingPriceUsd = $state('');
	let ttmRevenueUsd = $state('');
	let monthlyRevenueUsd = $state('');
	let ttmProfitUsd = $state('');
	let monthlyProfitUsd = $state('');
	let sellingReason = $state('');
	let includedAssets = $state<string[]>([]);

	let logoUploadRef: BusinessProfileLogoUpload | undefined = $state();
	let galleryUploadRef: BusinessProfileGalleryUpload | undefined = $state();

	const profileId = $derived(initial?.id ?? null);
	const directorySlug = $derived(suggestBusinessProfileSlug(name));

	function profileDataFromForm(): BusinessProfileDataFormInput {
		const emptyToUndefined = (value: string) => (value.trim() ? value.trim() : undefined);
		return {
			slug: directorySlug ? directorySlug : undefined,
			category: emptyToUndefined(category),
			pricing_type: pricingType === '' ? undefined : pricingType,
			tags,
			is_open_source: isOpenSource,
			repository_url: emptyToUndefined(repositoryUrl),
			launch_video_url: emptyToUndefined(launchVideoUrl),
			gallery_urls: galleryUrls,
			social_x: emptyToUndefined(socialX),
			social_github: emptyToUndefined(socialGithub),
			social_instagram: emptyToUndefined(socialInstagram),
			social_linkedin: emptyToUndefined(socialLinkedin),
			social_tiktok: emptyToUndefined(socialTiktok),
			social_facebook: emptyToUndefined(socialFacebook),
			social_youtube: emptyToUndefined(socialYoutube),
			social_bluesky: emptyToUndefined(socialBluesky),
			acquisition_listed: acquisitionListed,
			asking_price_usd: askingPriceUsd,
			ttm_revenue_usd: ttmRevenueUsd,
			monthly_revenue_usd: monthlyRevenueUsd,
			ttm_profit_usd: ttmProfitUsd,
			monthly_profit_usd: monthlyProfitUsd,
			selling_reason: emptyToUndefined(sellingReason),
			included_assets: includedAssets as BusinessProfileDataFormValues['included_assets']
		};
	}

	function hydrateFromInitial(source: Partial<AutoLaunchProductProfileDto> | null) {
		const pd = source?.profileData ?? {};
		name = source?.name ?? '';
		tagline = source?.tagline ?? '';
		description = source?.description ?? '';
		websiteUrl = source?.websiteUrl ?? '';
		logoUrl = source?.logoUrl ?? null;

		category = pd.category ?? '';
		pricingType = pd.pricing_type ?? '';
		tags = pd.tags ? [...pd.tags] : [];
		isOpenSource = Boolean(pd.is_open_source);
		repositoryUrl = pd.repository_url ?? '';
		launchVideoUrl = pd.launch_video_url ?? '';
		galleryUrls = pd.gallery_urls ? [...pd.gallery_urls] : [];

		socialX = pd.social_x ?? '';
		socialGithub = pd.social_github ?? '';
		socialInstagram = pd.social_instagram ?? '';
		socialLinkedin = pd.social_linkedin ?? '';
		socialTiktok = pd.social_tiktok ?? '';
		socialFacebook = pd.social_facebook ?? '';
		socialYoutube = pd.social_youtube ?? '';
		socialBluesky = pd.social_bluesky ?? '';

		acquisitionListed = Boolean(pd.acquisition_listed);
		askingPriceUsd = pd.asking_price_usd != null ? String(pd.asking_price_usd) : '';
		ttmRevenueUsd = pd.ttm_revenue_usd != null ? String(pd.ttm_revenue_usd) : '';
		monthlyRevenueUsd = pd.monthly_revenue_usd != null ? String(pd.monthly_revenue_usd) : '';
		ttmProfitUsd = pd.ttm_profit_usd != null ? String(pd.ttm_profit_usd) : '';
		monthlyProfitUsd = pd.monthly_profit_usd != null ? String(pd.monthly_profit_usd) : '';
		sellingReason = pd.selling_reason ?? '';
		includedAssets = pd.included_assets ? [...pd.included_assets] : [];

		tagInput = '';
		activeTab = 'general';
	}

	$effect(() => {
		if (!open) return;
		formFieldErrors = {};
		hydrateFromInitial(initial);
	});

	function normalizeWebsiteUrlOnBlur() {
		const trimmed = websiteUrl.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== websiteUrl) websiteUrl = normalized;
	}

	function normalizeRepositoryUrlOnBlur() {
		const trimmed = repositoryUrl.trim();
		if (!trimmed) return;
		const normalized = normalizeHttpUrlInputIfLikely(trimmed);
		if (normalized !== repositoryUrl) repositoryUrl = normalized;
	}

	function addTag() {
		const next = tagInput.trim();
		if (!next) return;
		if (tags.length >= BUSINESS_PROFILE_MAX_TAGS) {
			toast.error(`You can add up to ${BUSINESS_PROFILE_MAX_TAGS} tags.`);
			return;
		}
		if (tags.some((t) => t.toLowerCase() === next.toLowerCase())) {
			tagInput = '';
			return;
		}
		tags = [...tags, next];
		tagInput = '';
	}

	function removeTag(tag: string) {
		tags = tags.filter((t) => t !== tag);
	}

	function toggleIncludedAsset(slugValue: string, checked: boolean) {
		if (checked) {
			if (!includedAssets.includes(slugValue)) {
				includedAssets = [...includedAssets, slugValue];
			}
		} else {
			includedAssets = includedAssets.filter((s) => s !== slugValue);
		}
	}

	export async function uploadMediaForProfile(targetProfileId: string): Promise<{
		logoUrl?: string | null;
		galleryUrls?: string[];
	}> {
		if (!organizationId) return {};
		const uploadUid = `${organizationId}/${targetProfileId}`;
		const nextLogo = await logoUploadRef?.uploadPending(uploadUid);
		const nextGallery = await galleryUploadRef?.uploadPending(uploadUid);
		return {
			...(nextLogo !== undefined ? { logoUrl: nextLogo } : {}),
			...(nextGallery !== undefined ? { galleryUrls: nextGallery } : {})
		};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		formFieldErrors = {};
		const profileData = profileDataFromForm();
		const result = autoLaunchProductProfileFormSchema.safeParse({
			name,
			tagline,
			description,
			websiteUrl,
			logoUrl,
			integrationCustomerId: initial?.integrationCustomerId ?? null,
			profileData
		});
		if (!result.success) {
			const validation = parseBusinessProfileFormIssues(result.error.issues);
			formFieldErrors = validation.fieldErrors;
			if (validation.firstTabWithError) {
				activeTab = validation.firstTabWithError;
			}
			toast.error(validation.toastMessage);
			return;
		}

		await onSubmit({
			name: result.data.name,
			tagline: result.data.tagline,
			description: result.data.description,
			websiteUrl: result.data.websiteUrl,
			logoUrl: result.data.logoUrl,
			profileData: result.data.profileData,
			integrationCustomerId: result.data.integrationCustomerId ?? null
		});
	}

	function handleCancel() {
		if (submitting) return;
		open = false;
		onCancel?.();
	}
</script>

<Dialog.Root
	bind:open
	onOpenChange={(next) => {
		if (!next && submitting) {
			open = true;
			return;
		}
		if (!next) onCancel?.();
	}}
>
	<Dialog.Content
		class="max-h-[min(90vh,840px)] max-w-[calc(100%-2rem)] gap-4 overflow-y-auto sm:max-w-4xl"
		showCloseButton={!submitting}
	>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description class="text-sm text-base-content/70">
				Match directory listing forms (general copy, media, socials, and acquisition fields). The extension
				uses this profile when filling submissions.
			</Dialog.Description>
		</Dialog.Header>

		<form class="flex min-h-0 flex-col gap-4" onsubmit={(e) => void handleSubmit(e)}>
			<Tabs.Root bind:value={activeTab} class="w-full">
				<Tabs.List
					class="inline-flex w-full flex-wrap gap-1 rounded-xl border-2 border-base-content/15 bg-base-200/60 p-1 shadow-sm !border-solid"
				>
					<Tabs.Trigger value="general" class={tabTriggerClass}>General</Tabs.Trigger>
					<Tabs.Trigger value="media" class={tabTriggerClass}>Media</Tabs.Trigger>
					<Tabs.Trigger value="socials" class={tabTriggerClass}>Socials</Tabs.Trigger>
					<Tabs.Trigger value="sell" class={tabTriggerClass}>Sell</Tabs.Trigger>
				</Tabs.List>

				<div class="mt-4 max-h-[min(60vh,28rem)] overflow-y-auto pr-1">
					{#if activeTab === 'general'}
						<div class="grid gap-3 sm:grid-cols-2">
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Product name</span>
								<input
									class={inputClasses('name')}
									type="text"
									bind:value={name}
									required
									maxlength={200}
									disabled={submitting}
									aria-invalid={fieldInvalid('name')}
									aria-describedby={fieldErr('name') ? 'business-profile-name-error' : undefined}
								/>
								{#if fieldErr('name')}
									<p id="business-profile-name-error" class="text-xs text-error" role="alert">
										{fieldErr('name')}
									</p>
								{/if}
							</label>
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Directory slug</span>
								<p class="text-xs text-base-content/60">
									From the product name for directory forms Updates when the name changes.
								</p>
								<input
									class="input input-bordered input-disabled w-full font-mono text-sm"
									type="text"
									value={directorySlug}
									disabled
									readonly
									tabindex={-1}
									aria-readonly="true"
								/>
							</label>
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Website URL</span>
								<p class="text-xs text-base-content/60">
									Adds https:// on blur when the value looks like a URL.
								</p>
								<ProviderHttpUrlInput
									id="business-profile-website-url"
									class={cn('w-full', fieldInvalid('websiteUrl') && 'input-error')}
									placeholder="https://example.com"
									bind:value={websiteUrl}
									disabled={submitting}
									onblur={normalizeWebsiteUrlOnBlur}
								/>
								{#if fieldErr('websiteUrl')}
									<p class="text-xs text-error" role="alert">{fieldErr('websiteUrl')}</p>
								{/if}
							</label>
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Category</span>
								<input
									class={inputClasses('profileData.category')}
									type="text"
									list="business-profile-categories"
									bind:value={category}
									maxlength={200}
									disabled={submitting}
									aria-invalid={fieldInvalid('profileData.category')}
								/>
								{#if fieldErr('profileData.category')}
									<p class="text-xs text-error" role="alert">{fieldErr('profileData.category')}</p>
								{/if}
								<datalist id="business-profile-categories">
									{#each COMMON_CATEGORIES as cat (cat)}
										<option value={cat}></option>
									{/each}
								</datalist>
							</label>
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Tagline</span>
								<input
									class={inputClasses('tagline')}
									type="text"
									bind:value={tagline}
									maxlength={500}
									disabled={submitting}
									aria-invalid={fieldInvalid('tagline')}
								/>
								{#if fieldErr('tagline')}
									<p class="text-xs text-error" role="alert">{fieldErr('tagline')}</p>
								{/if}
							</label>
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Pricing</span>
								<select
									class={cn('select select-bordered w-full', fieldInvalid('profileData.pricing_type') && 'select-error')}
									bind:value={pricingType}
									disabled={submitting}
									aria-invalid={fieldInvalid('profileData.pricing_type')}
								>
									<option value="">Not set</option>
									{#each BUSINESS_PROFILE_PRICING_TYPES as pt (pt)}
										<option value={pt}>{pt}</option>
									{/each}
								</select>
								{#if fieldErr('profileData.pricing_type')}
									<p class="text-xs text-error" role="alert">{fieldErr('profileData.pricing_type')}</p>
								{/if}
							</label>
							<div class="form-control w-full gap-1 sm:col-span-2">
								<span class="text-sm font-medium text-base-content">
									Tags (max {BUSINESS_PROFILE_MAX_TAGS})
								</span>
								{#if fieldErr('profileData.tags')}
									<p class="text-xs text-error" role="alert">{fieldErr('profileData.tags')}</p>
								{/if}
								<div class="flex flex-wrap gap-2">
									{#each tags as tag (tag)}
										<span class="badge badge-outline gap-1 pr-1">
											{tag}
											<button
												type="button"
												class="rounded-full px-1 hover:bg-base-content/10"
												disabled={submitting}
												aria-label="Remove tag {tag}"
												onclick={() => removeTag(tag)}
											>
												<AbstractIcon name={icons.X2.name} width="12" height="12" />
											</button>
										</span>
									{/each}
								</div>
								<div class="flex gap-2">
									<input
										class="input input-bordered input-sm min-w-0 flex-1"
										type="text"
										bind:value={tagInput}
										placeholder="Add a tag"
										maxlength={80}
										disabled={submitting || tags.length >= BUSINESS_PROFILE_MAX_TAGS}
										onkeydown={(e) => {
											if (e.key === 'Enter') {
												e.preventDefault();
												addTag();
											}
										}}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										disabled={submitting || tags.length >= BUSINESS_PROFILE_MAX_TAGS}
										onclick={addTag}
									>
										Add
									</Button>
								</div>
							</div>
							<div
								class="flex items-center justify-between gap-3 rounded-lg border border-base-300/80 px-3 py-2"
							>
								<div class="min-w-0">
									<p class="text-sm font-medium text-base-content">Open source</p>
									<p class="text-xs text-base-content/60">Show repository link on directory forms.</p>
								</div>
								<Switch bind:checked={isOpenSource} disabled={submitting} />
							</div>
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Repository URL</span>
								<p class="text-xs text-base-content/60">
									{#if isOpenSource}
										Adds https:// on blur when the value looks like a URL.
									{:else}
										Enable open source to edit.
									{/if}
								</p>
								<ProviderHttpUrlInput
									id="business-profile-repository-url"
									class={cn('w-full', fieldInvalid('profileData.repository_url') && 'input-error')}
									placeholder="https://github.com/org/repo"
									bind:value={repositoryUrl}
									disabled={submitting || !isOpenSource}
									onblur={normalizeRepositoryUrlOnBlur}
								/>
								{#if fieldErr('profileData.repository_url')}
									<p class="text-xs text-error" role="alert">{fieldErr('profileData.repository_url')}</p>
								{/if}
							</label>
							<div class="form-control w-full gap-1 sm:col-span-2">
								<span class="text-sm font-medium text-base-content">Rich description</span>
								<RichHtmlField
									enableInlineImages={false}
									value={description ?? ''}
									onChange={(html) => {
										description = html;
									}}
									placeholder="Describe your product for directory listings…"
									class={cn('min-h-32', fieldInvalid('description') && 'ring-2 ring-error/60 rounded-md')}
								/>
								{#if fieldErr('description')}
									<p class="text-xs text-error" role="alert">{fieldErr('description')}</p>
								{/if}
							</div>
						</div>
					{:else if activeTab === 'media'}
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="sm:col-span-2">
								<p class="text-sm font-medium text-base-content">Logo</p>
								<p class="mb-2 text-xs text-base-content/60">
									Stored in your workspace media bucket{profileId ? '' : ' — save the profile once, then upload on save'}.
								</p>
								<BusinessProfileLogoUpload
									bind:this={logoUploadRef}
									value={logoUrl}
									onChange={(path) => {
										logoUrl = path;
									}}
									disabled={submitting}
								/>
							</div>
							<label class="form-control w-full gap-1 sm:col-span-2">
								<span class="text-sm font-medium text-base-content">Launch video URL</span>
								<input
									class={inputClasses('profileData.launch_video_url')}
									type="url"
									bind:value={launchVideoUrl}
									placeholder="https://"
									disabled={submitting}
									aria-invalid={fieldInvalid('profileData.launch_video_url')}
								/>
								{#if fieldErr('profileData.launch_video_url')}
									<p class="text-xs text-error" role="alert">{fieldErr('profileData.launch_video_url')}</p>
								{/if}
							</label>
							<div class="sm:col-span-2">
								<p class="text-sm font-medium text-base-content">Gallery</p>
								<BusinessProfileGalleryUpload
									bind:this={galleryUploadRef}
									urls={galleryUrls}
									onChange={(paths) => {
										galleryUrls = paths;
									}}
									disabled={submitting}
								/>
							</div>
						</div>
					{:else if activeTab === 'socials'}
						<div class="grid gap-3 sm:grid-cols-2">
							{#each [
								{ label: 'X (Twitter)', key: 'profileData.social_x', value: socialX, set: (v: string) => (socialX = v) },
								{ label: 'GitHub', key: 'profileData.social_github', value: socialGithub, set: (v: string) => (socialGithub = v) },
								{ label: 'Instagram', key: 'profileData.social_instagram', value: socialInstagram, set: (v: string) => (socialInstagram = v) },
								{ label: 'LinkedIn', key: 'profileData.social_linkedin', value: socialLinkedin, set: (v: string) => (socialLinkedin = v) },
								{ label: 'TikTok', key: 'profileData.social_tiktok', value: socialTiktok, set: (v: string) => (socialTiktok = v) },
								{ label: 'Facebook', key: 'profileData.social_facebook', value: socialFacebook, set: (v: string) => (socialFacebook = v) },
								{ label: 'YouTube', key: 'profileData.social_youtube', value: socialYoutube, set: (v: string) => (socialYoutube = v) },
								{ label: 'Bluesky', key: 'profileData.social_bluesky', value: socialBluesky, set: (v: string) => (socialBluesky = v), wide: true }
							] as row (row.key)}
								<label class={cn('form-control w-full gap-1', row.wide && 'sm:col-span-2')}>
									<span class="text-sm font-medium text-base-content">{row.label}</span>
									<input
										class={inputClasses(row.key)}
										type="url"
										value={row.value}
										oninput={(e) => row.set(e.currentTarget.value)}
										disabled={submitting}
										aria-invalid={fieldInvalid(row.key)}
									/>
									{#if fieldErr(row.key)}
										<p class="text-xs text-error" role="alert">{fieldErr(row.key)}</p>
									{/if}
								</label>
							{/each}
						</div>
					{:else}
						<div class="space-y-4">
							<div class="flex items-center justify-between gap-3 rounded-lg border border-base-300/80 px-3 py-2">
								<div>
									<p class="text-sm font-medium text-base-content">Listed for acquisition</p>
									<p class="text-xs text-base-content/60">Optional sell-side fields for marketplaces.</p>
								</div>
								<Switch bind:checked={acquisitionListed} disabled={submitting} />
							</div>
							<div class="grid gap-3 sm:grid-cols-2">
								<label class="form-control w-full gap-1">
									<span class="text-sm font-medium text-base-content">Asking price (USD)</span>
									<input
										class="input input-bordered w-full"
										type="text"
										inputmode="decimal"
										bind:value={askingPriceUsd}
										disabled={submitting}
									/>
								</label>
								<label class="form-control w-full gap-1">
									<span class="text-sm font-medium text-base-content">TTM revenue (USD)</span>
									<input
										class="input input-bordered w-full"
										type="text"
										inputmode="decimal"
										bind:value={ttmRevenueUsd}
										disabled={submitting}
									/>
								</label>
								<label class="form-control w-full gap-1">
									<span class="text-sm font-medium text-base-content">Monthly revenue (USD)</span>
									<input
										class="input input-bordered w-full"
										type="text"
										inputmode="decimal"
										bind:value={monthlyRevenueUsd}
										disabled={submitting}
									/>
								</label>
								<label class="form-control w-full gap-1">
									<span class="text-sm font-medium text-base-content">TTM profit (USD)</span>
									<input
										class="input input-bordered w-full"
										type="text"
										inputmode="decimal"
										bind:value={ttmProfitUsd}
										disabled={submitting}
									/>
								</label>
								<label class="form-control w-full gap-1 sm:col-span-2">
									<span class="text-sm font-medium text-base-content">Monthly profit (USD)</span>
									<input
										class="input input-bordered w-full"
										type="text"
										inputmode="decimal"
										bind:value={monthlyProfitUsd}
										disabled={submitting}
									/>
								</label>
							</div>
							<label class="form-control w-full gap-1">
								<span class="text-sm font-medium text-base-content">Selling reason</span>
								<textarea
									class={cn(
										'textarea textarea-bordered w-full min-h-24',
										fieldInvalid('profileData.selling_reason') && 'textarea-error'
									)}
									bind:value={sellingReason}
									disabled={submitting}
									placeholder="Why are you selling? (required when listed for acquisition)"
									aria-invalid={fieldInvalid('profileData.selling_reason')}
								></textarea>
								{#if fieldErr('profileData.selling_reason')}
									<p class="text-xs text-error" role="alert">{fieldErr('profileData.selling_reason')}</p>
								{/if}
							</label>
							<div class="space-y-2">
								<p class="text-sm font-medium text-base-content">Included assets</p>
								<div class="grid gap-2 sm:grid-cols-2">
									{#each BUSINESS_PROFILE_INCLUDED_ASSET_OPTIONS as option (option.slug)}
										<label class="flex cursor-pointer items-center gap-2 text-sm">
											<Checkbox
												checked={includedAssets.includes(option.slug)}
												onCheckedChange={(checked) => {
													toggleIncludedAsset(option.slug, checked === true);
												}}
												disabled={submitting}
											/>
											{option.label}
										</label>
									{/each}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</Tabs.Root>

			<Dialog.Footer class="gap-2 pt-2 sm:gap-2">
				<Button type="button" variant="outline" disabled={submitting} onclick={handleCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={submitting}>
					{#if submitting}
						<AbstractIcon
							name={icons.LoaderCircle.name}
							class="mr-2 h-4 w-4 animate-spin"
							width="16"
							height="16"
						/>
						Saving…
					{:else}
						Save profile
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
