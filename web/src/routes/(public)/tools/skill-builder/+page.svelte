<script lang="ts">
	import type { PageData } from './$types';
	import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type {
		SkillBuilderLibraryItemViewModel,
		SkillBuilderWorkflowStepViewModel
	} from '$lib/skill-builder/skillBuilder.types';

	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { nanoid } from 'nanoid';

	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { getRootPathAccount, getAccountNewPlaybookPath } from '$lib/area-protected';
	import { getBillingPresenter } from '$lib/billing';
	import { CREATING_SKILLS_DOC_URL, OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/skill-builder/constants/defaults';
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
	import { getRootPathSignin } from '$lib/user-auth/constants/getRootpathUserAuth';
	import { route, url, absoluteUrl } from '$lib/utils/path';
	import { planLimitsForTier } from 'openquok-common';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import SkillBuilderLibraryPanel from '$lib/ui/templates/skill-builder/SkillBuilderLibraryPanel.svelte';
	import SkillBuilderWorkflowPanel from '$lib/ui/templates/skill-builder/SkillBuilderWorkflowPanel.svelte';
	import SkillBuilderPreviewPanel from '$lib/ui/templates/skill-builder/SkillBuilderPreviewPanel.svelte';
	import SignInToSaveListingModal from '$lib/ui/components/skill-builder/SignInToSaveListingModal.svelte';
	import CommunityFeaturesLimitUpgradeModal from '$lib/ui/components/blog-post/CommunityFeaturesLimitUpgradeModal.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let selectedBuildingBlockSlugs = $derived(data.selectedBuildingBlockSlugs);
	let buildingBlocksCatalog = $derived(data.buildingBlocksCatalog);
	let selectedBuildingBlocks = $derived(data.selectedBuildingBlocks);
	let initialWorkflowSteps = $derived(data.initialWorkflowSteps);
	let stackTitle = $derived(data.stackTitle);
	let stackSlug = $derived(data.stackSlug);

	// /tools/skill-builder
	const rootPathPublicSkillBuilder = getRootPathPublicSkillBuilder();
	const skillBuilderPath = route(rootPathPublicSkillBuilder);

	// /sign-in
	const rootPathSignIn = getRootPathSignin();
	const signInHref = url(route(rootPathSignIn));

	// /account/playbooks/playbook/new
	const rootPathAccount = getRootPathAccount();
	const newStackHref = absoluteUrl(`${rootPathAccount}/${getAccountNewPlaybookPath()}`);
	const accountBillingHref = url(`${route(rootPathAccount)}/billing`);

	const serverHydrationKey = $derived(
		`${selectedBuildingBlockSlugs.join(',')}|${stackSlug ?? ''}|${initialWorkflowSteps.length}`
	);

	let hydratedFrom = $state('');

	let activeBuildingBlockSlugs = $state<string[]>([]);
	let buildingBlockDetails = $state<ExtensionDetailViewModel[]>([]);
	let workflowSteps = $state<SkillBuilderWorkflowStepViewModel[]>([]);
	let loadingBuildingBlockSlug = $state<string | null>(null);

	const libraryItems = $derived(buildLibraryItems(buildingBlockDetails));

	const exportTitle = $derived(stackTitle?.trim() || 'My First Skill');

	const generatedMarkdown = $derived(
		generateSkillMarkdown({
			title: exportTitle,
			extensionSlugs: activeBuildingBlockSlugs,
			extensions: buildingBlockDetails,
			workflowSteps
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
		buildingBlockDetails = selectedBuildingBlocks.map((buildingBlock) => ({ ...buildingBlock }));
		workflowSteps = initialWorkflowSteps.map((step) => ({ ...step, id: step.id || nanoid() }));
		exportMarkdownEdited = false;
	});

	$effect(() => {
		if (exportMarkdownEdited) return;
		exportMarkdown = generatedMarkdown;
	});

	onMount(() => {
		const pendingDraft = readSkillBuilderStackDraft();
		if (!pendingDraft || stackSlug) return;

		pendingDraftBuildingBlockIdsBySlug = { ...pendingDraft.extensionIdsBySlug };
		pendingDraftBuildingBlockTypesBySlug = { ...(pendingDraft.extensionTypesBySlug ?? {}) };

		if (pendingDraft.workflowSteps.length > 0) {
			workflowSteps = pendingDraft.workflowSteps.map((step) => ({
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

	const isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);

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
			workflowSteps,
			extensions: buildingBlockDetails,
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
			buildingBlockDetails = buildingBlockDetails.filter((buildingBlock) => buildingBlock.slug !== slug);
			syncUrl(nextSlugs);
			return;
		}

		loadingBuildingBlockSlug = slug;
		try {
			const buildingBlock = await getListingPresenter.loadPublishedExtensionBySlugStateless(slug);
			if (!buildingBlock) return;
			activeBuildingBlockSlugs = nextSlugs;
			buildingBlockDetails = [...buildingBlockDetails, buildingBlock];
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
		const nextUrl = `${skillBuilderPath}?${params.toString()}`;
		window.history.replaceState(window.history.state, '', nextUrl);
	}

	function addLibraryItem(itemVm: SkillBuilderLibraryItemViewModel) {
		const workflowDefaults = buildCommandWorkflowStepFromLibraryItem(itemVm);

		workflowSteps = [
			...workflowSteps,
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
		workflowSteps = [
			...workflowSteps,
			{
				id: nanoid(),
				type: 'text',
				content: ''
			}
		];
	}

	function updateStep(stepId: string, patch: Partial<SkillBuilderWorkflowStepViewModel>) {
		workflowSteps = workflowSteps.map((step) =>
			step.id === stepId ? ({ ...step, ...patch } as SkillBuilderWorkflowStepViewModel) : step
		);
	}

	function removeStep(stepId: string) {
		workflowSteps = workflowSteps.filter((step) => step.id !== stepId);
	}

	function reorderSteps(fromIndex: number, toIndex: number) {
		if (fromIndex === toIndex) return;
		const next = [...workflowSteps];
		const [moved] = next.splice(fromIndex, 1);
		next.splice(toIndex, 0, moved);
		workflowSteps = next;
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-8 md:py-12">
	<header class="container mx-auto max-w-[1600px] space-y-4 px-4">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Free tool</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{metaTitle}</h1>
		<p class="max-w-3xl text-base text-base-content/70">{metaDescription}</p>
		<p class="max-w-3xl text-sm text-base-content/60">
			Export follows the
			<ExternalLink href={CREATING_SKILLS_DOC_URL}>SKILL.md format</ExternalLink>
			— edit frontmatter, instructions, and examples, then download for your agent workspace.
		</p>

		{#if stackTitle}
			<p class="text-sm text-base-content/60">
				Loaded from stack <span class="font-semibold text-base-content">{stackTitle}</span>
			</p>
		{/if}

		<div class="pt-2">
			<p class="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">
				Selected building blocks
			</p>
			<div class="flex flex-wrap gap-2">
				{#each buildingBlocksCatalog as buildingBlock (buildingBlock.id)}
					{@const selected = activeBuildingBlockSlugs.includes(buildingBlock.slug)}
					<button
						type="button"
						class="btn btn-sm {selected ? 'btn-primary' : 'btn-outline'}"
						disabled={loadingBuildingBlockSlug === buildingBlock.slug}
						onclick={() => void toggleBuildingBlockSlug(buildingBlock.slug)}
					>
						{#if selected}
							<span aria-hidden="true">✓</span>
						{/if}
						{buildingBlock.title}
					</button>
				{/each}
			</div>
		</div>
	</header>

	<section class="container mx-auto mt-8 max-w-[1600px] px-4">
		<div class="flex flex-col gap-4">
			<div class="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100">
				<SkillBuilderLibraryPanel
					itemsVm={libraryItems}
					onAddItem={addLibraryItem}
				/>
			</div>

			<div class="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-3">
				<div class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 lg:col-span-1">
					<SkillBuilderWorkflowPanel
						stepsVm={workflowSteps}
						onUpdateStep={updateStep}
						onRemoveStep={removeStep}
						onReorder={reorderSteps}
						onAddTextStep={addTextStep}
					/>
				</div>
				<div class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 lg:col-span-2">
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
</SectionOuterContainer>

<SignInToSaveListingModal bind:open={showSignInModal} {signInHref} />

<CommunityFeaturesLimitUpgradeModal
	bind:open={showUpgradeModal}
	upgradeHref={accountBillingHref}
	feature="listings"
/>
