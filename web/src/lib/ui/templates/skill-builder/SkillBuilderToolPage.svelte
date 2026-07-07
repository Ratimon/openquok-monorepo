<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type {
		SkillBuilderChannelHubLinkViewModel,
		SkillBuilderLibraryItemViewModel,
		SkillBuilderWorkflowStepViewModel
	} from '$lib/skill-builder/skillBuilder.types';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { nanoid } from 'nanoid';

	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import {
		getRootPathPublicSkillBuilder,
		getRootPathPublicTools
	} from '$lib/area-public/constants/getRootPathPublicTools';
	import { getRootPathAccount, getAccountNewPlaybookPath } from '$lib/area-protected';
	import { getBillingPresenter } from '$lib/billing';
	import { CREATING_SKILLS_DOC_URL, OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/skill-builder/constants/defaults';
	import { buildSkillBuilderFaqSection } from '$lib/skill-builder/constants/publicSkillBuilderFaqConfig';
	import { saveSkillBuilderStackDraft, readSkillBuilderStackDraft } from '$lib/skill-builder/constants/skillBuilderDraftStorage';
	import { buildSkillBuilderStackDraft } from '$lib/skill-builder/utils/buildSkillBuilderStackDraft';
	import { buildCommandWorkflowStepFromLibraryItem } from '$lib/skill-builder/constants/openquokCommandWorkflowMeta';
	import { getListingPresenter } from '$lib/listings';
	import { buildLibraryItems } from '$lib/skill-builder/utils/buildLibraryItems';
	import { generateSkillMarkdown } from '$lib/skill-builder/utils/generateSkillMarkdown';
	import {
		SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM,
		serializeExtensionSlugs,
		ensureOpenquokCoreExtensionSlug
	} from '$lib/skill-builder/utils/parseBuilderQuery';
	import { authenticationRepository } from '$lib/user-auth';
	import { getRootPathSignin, getRootPathSignup } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url, absoluteUrl } from '$lib/utils/path';
	import { planLimitsForTier } from 'openquok-common';
	import { icons } from '$data/icons';

	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import SkillBuilderHubBreadcrumb from '$lib/ui/components/skill-builder/SkillBuilderHubBreadcrumb.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SkillBuilderLibraryPanel from '$lib/ui/templates/skill-builder/SkillBuilderLibraryPanel.svelte';
	import SkillBuilderWorkflowPanel from '$lib/ui/templates/skill-builder/SkillBuilderWorkflowPanel.svelte';
	import SkillBuilderPreviewPanel from '$lib/ui/templates/skill-builder/SkillBuilderPreviewPanel.svelte';
	import SignInToSaveListingModal from '$lib/ui/components/skill-builder/SignInToSaveListingModal.svelte';
	import SkillBuilderBuildingBlocksPickerModal from '$lib/ui/components/skill-builder/SkillBuilderBuildingBlocksPickerModal.svelte';
	import SkillBuilderChannelHubGrid from '$lib/ui/components/skill-builder/SkillBuilderChannelHubGrid.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';
	import AccentSplitCtaBanner from '$lib/ui/templates/banners/AccentSplitCtaBanner.svelte';
	import CenteredDarkCtaBanner from '$lib/ui/templates/banners/CenteredDarkCtaBanner.svelte';
	import {
		CENTERED_DARK_CTA_BANNER_DESCRIPTION,
		CENTERED_DARK_CTA_BANNER_TITLE,
		PUBLIC_BANNER_CTA_TEXT,
		PUBLIC_DOCS_BANNER_CTA_TEXT
	} from '$lib/ui/templates/banners/centeredDarkCtaBannerCopy';
	import {
		SKILL_BUILDER_DOCS_BANNER,
		accentSplitSkillBuilderCliCtaBannerDescription,
		accentSplitSkillBuilderCliCtaBannerTitle
	} from '$lib/ui/templates/banners/skillBuilderBannerCopy';
	import PublicFaq from '$lib/ui/templates/faq/PublicFaq.svelte';
	import { landingHeroTheme } from '$lib/ui/templates/landing-page/landingHeroTheme';

	type Props = {
		metaTitle: string;
		metaDescription: string;
		selectedBuildingBlockSlugs: string[];
		selectedBuildingBlocksVm: ExtensionDetailViewModel[];
		initialWorkflowStepsVm: SkillBuilderWorkflowStepViewModel[];
		stackTitle: string | null;
		stackSlug: string | null;
		isLoggedIn?: boolean;
		skillBuilderBasePath?: string;
		channelSlug?: string | null;
		channelLabel?: string | null;
		cliExamplesPath?: string | null;
		channelLinksVm?: SkillBuilderChannelHubLinkViewModel[];
	};

	let {
		metaTitle,
		metaDescription,
		selectedBuildingBlockSlugs,
		selectedBuildingBlocksVm,
		initialWorkflowStepsVm,
		stackTitle,
		stackSlug,
		isLoggedIn: isLoggedInFromLoad = false,
		skillBuilderBasePath = route(getRootPathPublicSkillBuilder()),
		channelSlug = null,
		channelLabel = null,
		cliExamplesPath = null,
		channelLinksVm = []
	}: Props = $props();

	// /tools
	const rootPathPublicTools = getRootPathPublicTools();
	const toolsHubHref = url(route(rootPathPublicTools));

	// /building-blocks
	const rootPathPublicBuildingBlocks = getRootPathPublicBuildingBlocks();
	const buildingBlocksHref = url(route(rootPathPublicBuildingBlocks));

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInHref = url(route(rootPathSignIn));

	// /sign-up
	const rootPathSignUp = getRootPathSignup();
	const signUpPath = route(rootPathSignUp);

	const skillBuilderDocsBanner = SKILL_BUILDER_DOCS_BANNER;

	// /account/playbooks/playbook/new
	const rootPathAccount = getRootPathAccount();
	const newStackHref = absoluteUrl(`${rootPathAccount}/${getAccountNewPlaybookPath()}`);
	const accountBillingHref = url(`${route(rootPathAccount)}/billing`);

	const genericSkillBuilderHref = url(route(getRootPathPublicSkillBuilder()));

	let accentBannerTitle = $derived(
		channelSlug && channelLabel
			? accentSplitSkillBuilderCliCtaBannerTitle(channelLabel)
			: skillBuilderDocsBanner.title
	);
	let accentBannerDescription = $derived(
		channelSlug && channelLabel
			? accentSplitSkillBuilderCliCtaBannerDescription(channelLabel)
			: skillBuilderDocsBanner.description
	);
	let accentBannerHref = $derived(cliExamplesPath ?? skillBuilderDocsBanner.docsPath);

	let faqSection = $derived(buildSkillBuilderFaqSection(channelSlug, channelLabel));

	const serverHydrationKey = $derived(
		`${channelSlug ?? ''}|${selectedBuildingBlockSlugs.join(',')}|${stackSlug ?? ''}|${initialWorkflowStepsVm.length}`
	);

	let hydratedFrom = $state('');

	let activeBuildingBlockSlugs = $state<string[]>([]);
	let buildingBlockDetailsVm = $state<ExtensionDetailViewModel[]>([]);
	let workflowStepsVm = $state<SkillBuilderWorkflowStepViewModel[]>([]);
	let loadingBuildingBlockSlug = $state<string | null>(null);
	let buildingBlocksPickerOpen = $state(false);

	const addBuildingBlockIconBtn =
		'border-base-300/90 bg-base-200/45 text-base-content/85 hover:bg-base-300/55 hover:text-base-content focus-visible:ring-primary/40 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-35';

	const libraryItemsVm = $derived(buildLibraryItems(buildingBlockDetailsVm));

	const exportTitle = $derived(
		stackTitle?.trim() || (channelLabel ? `${channelLabel} Skill` : 'My First Skill')
	);

	const generatedMarkdown = $derived(
		generateSkillMarkdown({
			title: exportTitle,
			extensionSlugs: activeBuildingBlockSlugs,
			extensions: buildingBlockDetailsVm,
			workflowSteps: workflowStepsVm
		})
	);

	let exportMarkdown = $state('');
	let exportMarkdownEdited = $state(false);
	let pendingDraftBuildingBlockIdsBySlug = $state<Record<string, string>>({});
	let pendingDraftBuildingBlockTypesBySlug = $state<Record<string, string | null>>({});

	$effect(() => {
		const key = serverHydrationKey;
		if (hydratedFrom === key) return;
		hydratedFrom = key;
		activeBuildingBlockSlugs = [...selectedBuildingBlockSlugs];
		buildingBlockDetailsVm = selectedBuildingBlocksVm.map((buildingBlock) => ({ ...buildingBlock }));
		workflowStepsVm = initialWorkflowStepsVm.map((step) => ({ ...step, id: step.id || nanoid() }));
		exportMarkdownEdited = false;
	});

	$effect(() => {
		if (exportMarkdownEdited) return;
		exportMarkdown = generatedMarkdown;
	});

	onMount(() => {
		if (channelSlug) return;

		const pendingDraft = readSkillBuilderStackDraft();
		if (!pendingDraft || stackSlug) return;

		pendingDraftBuildingBlockIdsBySlug = { ...pendingDraft.extensionIdsBySlug };
		pendingDraftBuildingBlockTypesBySlug = { ...(pendingDraft.extensionTypesBySlug ?? {}) };

		if (pendingDraft.workflowSteps.length > 0) {
			workflowStepsVm = pendingDraft.workflowSteps.map((step) => ({
				...step,
				id: step.id || nanoid()
			}));
		}

		if (pendingDraft.markdown.trim()) {
			exportMarkdown = pendingDraft.markdown;
			exportMarkdownEdited = true;
		}
	});

	function markExportMarkdownEdited() {
		exportMarkdownEdited = true;
	}

	const downloadFilename = $derived('SKILL.md');

	const isLoggedIn = $derived(authenticationRepository.isAuthenticated() || isLoggedInFromLoad === true);

	let viewerPublicApiEnabled = $state<boolean | null>(null);
	let showSignInModal = $state(false);
	let showUpgradeModal = $state(false);

	$effect(() => {
		if (!browser || !isLoggedIn) {
			viewerPublicApiEnabled = null;
			return;
		}
		let cancelled = false;
		void getBillingPresenter.loadOwnedAccountBillingVmStateless().then((vm) => {
			if (cancelled) return;
			viewerPublicApiEnabled = vm ? planLimitsForTier(vm.tier).public_api : false;
		});
		return () => {
			cancelled = true;
		};
	});

	const listingsPaidEnabled = $derived(viewerPublicApiEnabled ?? true);

	function handleSaveAsStack() {
		if (!isLoggedIn) {
			showSignInModal = true;
			return;
		}
		if (!listingsPaidEnabled) {
			showUpgradeModal = true;
			return;
		}

		const draft = buildSkillBuilderStackDraft({
			title: exportTitle,
			markdown: exportMarkdown.trim() || generatedMarkdown,
			extensionSlugs: activeBuildingBlockSlugs,
			workflowSteps: workflowStepsVm,
			extensions: buildingBlockDetailsVm,
			extensionIdsBySlugOverride: pendingDraftBuildingBlockIdsBySlug,
			extensionTypesBySlugOverride: pendingDraftBuildingBlockTypesBySlug
		});
		saveSkillBuilderStackDraft(draft);
		void goto(newStackHref);
	}

	async function toggleBuildingBlockSlug(slug: string) {
		if (slug === OPENQUOK_CORE_EXTENSION_SLUG && activeBuildingBlockSlugs.includes(slug)) {
			return;
		}

		const isSelected = activeBuildingBlockSlugs.includes(slug);
		const nextSlugs = isSelected
			? activeBuildingBlockSlugs.filter((value) => value !== slug)
			: [...activeBuildingBlockSlugs, slug];

		if (nextSlugs.length === 0) return;

		if (isSelected) {
			activeBuildingBlockSlugs = nextSlugs;
			buildingBlockDetailsVm = buildingBlockDetailsVm.filter((buildingBlock) => buildingBlock.slug !== slug);
			syncUrl(nextSlugs);
			return;
		}

		loadingBuildingBlockSlug = slug;
		try {
			const buildingBlock = await getListingPresenter.loadPublishedExtensionBySlugStateless(slug);
			if (!buildingBlock) return;
			activeBuildingBlockSlugs = nextSlugs;
			buildingBlockDetailsVm = [...buildingBlockDetailsVm, buildingBlock];
			syncUrl(nextSlugs);
		} finally {
			loadingBuildingBlockSlug = null;
		}
	}

	function syncUrl(slugs: string[]) {
		if (!browser) return;
		const params = new URLSearchParams();
		params.set(
			SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM,
			serializeExtensionSlugs(ensureOpenquokCoreExtensionSlug(slugs))
		);
		const nextUrl = `${skillBuilderBasePath}?${params.toString()}`;
		window.history.replaceState(window.history.state, '', nextUrl);
	}

	function addLibraryItem(itemVm: SkillBuilderLibraryItemViewModel) {
		const workflowDefaults = buildCommandWorkflowStepFromLibraryItem(itemVm);

		workflowStepsVm = [
			...workflowStepsVm,
			{
				id: nanoid(),
				type: 'command',
				kind: itemVm.kind,
				listingSlug: itemVm.listingSlug,
				listingTitle: itemVm.listingTitle,
				commandName: itemVm.name,
				title: workflowDefaults.title,
				prompt: workflowDefaults.prompt,
				examplePayload: workflowDefaults.examplePayload,
				commandTemplate: workflowDefaults.commandTemplate
			}
		];
	}

	function addTextStep() {
		workflowStepsVm = [
			...workflowStepsVm,
			{
				id: nanoid(),
				type: 'text',
				content: ''
			}
		];
	}

	function updateStep(stepId: string, patch: Partial<SkillBuilderWorkflowStepViewModel>) {
		workflowStepsVm = workflowStepsVm.map((step) =>
			step.id === stepId ? ({ ...step, ...patch } as SkillBuilderWorkflowStepViewModel) : step
		);
	}

	function removeStep(stepId: string) {
		workflowStepsVm = workflowStepsVm.filter((step) => step.id !== stepId);
	}

	function reorderSteps(fromIndex: number, toIndex: number) {
		if (fromIndex === toIndex) return;
		const next = [...workflowStepsVm];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		workflowStepsVm = next;
	}
</script>

<SectionOuterContainer class="py-8 md:py-12">
	<header class="container mx-auto max-w-[1600px] space-y-4 px-4">
		<SkillBuilderHubBreadcrumb
			{toolsHubHref}
			skillBuilderHref={genericSkillBuilderHref}
			{channelLabel}
		/>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">
			{metaTitle}
		</h1>
		<p class="max-w-3xl text-base text-base-content/70">
			{metaDescription}
		</p>
		<p class="max-w-3xl text-sm text-base-content/60">
			Export follows the
			<ExternalLink href={CREATING_SKILLS_DOC_URL}>SKILL.md format</ExternalLink>
			— edit frontmatter, instructions, and examples, then download for your agent workspace.
		</p>

		{#if channelSlug && cliExamplesPath}
			<p class="max-w-3xl text-sm text-base-content/60">
				CLI recipes are pre-loaded from
				<a class="link link-primary" href={cliExamplesPath}>{channelLabel} CLI examples</a>.
				Need a generic builder?
				<a class="link link-primary" href={genericSkillBuilderHref}>Skill Builder for all channels</a>.
			</p>
		{/if}

		{#if stackTitle}
			<p class="text-sm text-base-content/60">
				Loaded from stack <span class="font-semibold text-base-content">{stackTitle}</span>
			</p>
		{/if}

		<div class="pt-2">
			<p class="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">
				Selected building blocks
			</p>
			<div class="flex flex-wrap items-center gap-2">
				{#each buildingBlockDetailsVm as buildingBlockVm (buildingBlockVm.slug)}
					<span
						class="badge badge-lg border-base-300/80 h-auto max-w-full gap-2 border bg-base-100 py-2 pr-2 pl-2 text-base-content"
					>
						{#if buildingBlockVm.logoImageUrl}
							<img
								src={buildingBlockVm.logoImageUrl}
								alt=""
								class="size-6 shrink-0 rounded-md object-cover"
								loading="lazy"
							/>
						{/if}
						<span class="truncate">
							{buildingBlockVm.title}
						</span>
						{#if buildingBlockVm.slug !== OPENQUOK_CORE_EXTENSION_SLUG}
							<button
								type="button"
								class="btn btn-ghost btn-xs btn-circle shrink-0"
								disabled={loadingBuildingBlockSlug === buildingBlockVm.slug}
								aria-label={`Remove ${buildingBlockVm.title}`}
								onclick={() => void toggleBuildingBlockSlug(buildingBlockVm.slug)}
							>
								<AbstractIcon name={icons.X2.name} class="size-3.5" width="14" height="14" />
							</button>
						{/if}
					</span>
				{/each}

				<button
					type="button"
					class={addBuildingBlockIconBtn}
					disabled={loadingBuildingBlockSlug != null}
					aria-label="Add building block"
					title="Add building block"
					onclick={() => (buildingBlocksPickerOpen = true)}
				>
					<span class="relative inline-flex size-5 items-center justify-center">
						<AbstractIcon name={icons.Grid3x3.name} class="size-5" width="20" height="20" />
						<span
							class="bg-primary text-primary-content ring-base-100 absolute -right-1.5 -bottom-1.5 flex size-3.5 items-center justify-center rounded-full ring-2"
							aria-hidden="true"
						>
							<AbstractIcon name={icons.Plus.name} class="size-2.5" width="10" height="10" />
						</span>
					</span>
				</button>
			</div>
			<p class="mt-2 text-sm text-base-content/60">
				Browse the full catalog on
				<ExternalLink href={buildingBlocksHref}>Building blocks</ExternalLink>
				, select cards there, then use Open Skill Builder — or add blocks with the button above.
			</p>
		</div>
	</header>

	<section class="container mx-auto mt-8 max-w-[1600px] px-4">
		<div class="flex flex-col gap-4">
			<div class="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100">
				<SkillBuilderLibraryPanel
					itemsVm={libraryItemsVm}
					onAddItem={addLibraryItem}
					/>
			</div>

			<div class="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-3">
				<div
					class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 lg:col-span-1"
				>
					<SkillBuilderWorkflowPanel
						stepsVm={workflowStepsVm}
						onUpdateStep={updateStep}
						onRemoveStep={removeStep}
						onReorder={reorderSteps}
						onAddTextStep={addTextStep}
					/>
				</div>
				<div
					class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 lg:col-span-2"
				>
					<SkillBuilderPreviewPanel
						bind:markdown={exportMarkdown}
						{downloadFilename}
						onMarkdownEdit={markExportMarkdownEdited}
						onSaveAsStack={handleSaveAsStack}
					/>
				</div>
			</div>
		</div>
	</section>

	{#if channelLinksVm.length > 0}
		<SkillBuilderChannelHubGrid
			{channelLinksVm}
			activeChannelSlug={channelSlug}
			genericHref={genericSkillBuilderHref}
		/>
	{/if}

	<div class="container mx-auto px-4">
		<PublicFaq
			heroTheme={landingHeroTheme}
			faqSubtitle={faqSection.faqSubtitle}
			faqTitle={faqSection.faqTitle}
			faqDescription={faqSection.faqDescription}
			faqItems={faqSection.faqItems}
			sectionClass="py-16 sm:py-20"
		/>

		<AccentSplitCtaBanner
			title={accentBannerTitle}
			description={accentBannerDescription}
			ctaText={PUBLIC_DOCS_BANNER_CTA_TEXT}
			ctaHref={accentBannerHref}
		/>

		<CenteredDarkCtaBanner
			title={CENTERED_DARK_CTA_BANNER_TITLE}
			description={CENTERED_DARK_CTA_BANNER_DESCRIPTION}
			ctaText={PUBLIC_BANNER_CTA_TEXT}
			ctaHref={signUpPath}
			sectionClass="pb-16 sm:pb-20"
		/>
	</div>
</SectionOuterContainer>

<SignInToSaveListingModal bind:open={showSignInModal} {signInHref} />

<SkillBuilderBuildingBlocksPickerModal
	bind:open={buildingBlocksPickerOpen}
	selectedSlugs={activeBuildingBlockSlugs}
	loadingSlug={loadingBuildingBlockSlug}
	onSelectSlug={toggleBuildingBlockSlug}
/>

<CommunityFeaturesLimitUpgradeModal
	bind:open={showUpgradeModal}
	upgradeHref={accountBillingHref}
	feature="listings"
/>
