<script lang="ts">
	import type { PageData } from './$types';
	import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type {
		StackBuilderLibraryItemViewModel,
		StackBuilderReferenceAssetViewModel,
		StackBuilderWorkflowStepViewModel
	} from '$lib/stack-builder/stackBuilder.types';

	import { browser } from '$app/environment';
	import { nanoid } from 'nanoid';

	import { getRootPathPublicAgentBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { CREATING_SKILLS_DOC_URL, OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/stack-builder/constants/defaults';
	import { buildCommandWorkflowStepFromLibraryItem } from '$lib/stack-builder/constants/openquokCommandWorkflowMeta';
	import { getListingPresenter } from '$lib/listings';
	import { buildLibraryItems } from '$lib/stack-builder/utils/buildLibraryItems';
	import { generateStackMarkdown } from '$lib/stack-builder/utils/generateStackMarkdown';
	import { serializeExtensionSlugs, ensureOpenquokCoreExtensionSlug } from '$lib/stack-builder/utils/parseBuilderQuery';
	import { route } from '$lib/utils/path';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import ExternalLink from '$lib/ui/components/ExternalLink.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StackBuilderLibraryPanel from '$lib/ui/templates/stack-builder/StackBuilderLibraryPanel.svelte';
	import StackBuilderWorkflowPanel from '$lib/ui/templates/stack-builder/StackBuilderWorkflowPanel.svelte';
	import StackBuilderPreviewPanel from '$lib/ui/templates/stack-builder/StackBuilderPreviewPanel.svelte';
	import StackBuilderReferenceAssetsPanel from '$lib/ui/templates/stack-builder/StackBuilderReferenceAssetsPanel.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let selectedExtensionSlugs = $derived(data.selectedExtensionSlugs);
	let extensionsCatalog = $derived(data.extensionsCatalog);
	let selectedExtensions = $derived(data.selectedExtensions);
	let initialWorkflowSteps = $derived(data.initialWorkflowSteps);
	let initialReferenceAssets = $derived(data.initialReferenceAssets);
	let stackTitle = $derived(data.stackTitle);
	let stackSlug = $derived(data.stackSlug);

	// /tools/agent-builder
	const rootPathPublicAgentBuilder = getRootPathPublicAgentBuilder();
	const agentBuilderPath = route(rootPathPublicAgentBuilder);

	const serverHydrationKey = $derived(
		`${selectedExtensionSlugs.join(',')}|${stackSlug ?? ''}|${initialWorkflowSteps.length}|${initialReferenceAssets.length}`
	);

	let hydratedFrom = $state('');

	let activeExtensionSlugs = $state<string[]>([]);
	let extensionDetails = $state<ExtensionDetailViewModel[]>([]);
	let workflowSteps = $state<StackBuilderWorkflowStepViewModel[]>([]);
	let referenceAssets = $state<StackBuilderReferenceAssetViewModel[]>([]);
	let loadingExtensionSlug = $state<string | null>(null);

	const libraryItems = $derived(buildLibraryItems(extensionDetails));

	const exportTitle = $derived(stackTitle?.trim() || 'My First Skill');

	const generatedMarkdown = $derived(
		generateStackMarkdown({
			title: exportTitle,
			extensionSlugs: activeExtensionSlugs,
			extensions: extensionDetails,
			referenceAssets,
			workflowSteps
		})
	);

	let exportMarkdown = $state('');
	let exportMarkdownEdited = $state(false);

	$effect(() => {
		const key = serverHydrationKey;
		if (hydratedFrom === key) return;
		hydratedFrom = key;
		activeExtensionSlugs = [...selectedExtensionSlugs];
		extensionDetails = selectedExtensions.map((extension) => ({ ...extension }));
		workflowSteps = initialWorkflowSteps.map((step) => ({ ...step, id: step.id || nanoid() }));
		referenceAssets = initialReferenceAssets.map((asset) => ({ ...asset }));
		exportMarkdownEdited = false;
	});

	$effect(() => {
		if (exportMarkdownEdited) return;
		exportMarkdown = generatedMarkdown;
	});

	function markExportMarkdownEdited() {
		exportMarkdownEdited = true;
	}

	const downloadFilename = $derived('SKILL.md');

	async function toggleExtensionSlug(slug: string) {
		if (slug === OPENQUOK_CORE_EXTENSION_SLUG && activeExtensionSlugs.includes(slug)) {
			return;
		}

		const isSelected = activeExtensionSlugs.includes(slug);
		const nextSlugs = isSelected
			? activeExtensionSlugs.filter((value) => value !== slug)
			: [...activeExtensionSlugs, slug];

		if (nextSlugs.length === 0) return;

		if (isSelected) {
			activeExtensionSlugs = nextSlugs;
			extensionDetails = extensionDetails.filter((extension) => extension.slug !== slug);
			syncUrl(nextSlugs);
			return;
		}

		loadingExtensionSlug = slug;
		try {
			const extension = await getListingPresenter.loadPublishedExtensionBySlugStateless(slug);
			if (!extension) return;
			activeExtensionSlugs = nextSlugs;
			extensionDetails = [...extensionDetails, extension];
			syncUrl(nextSlugs);
		} finally {
			loadingExtensionSlug = null;
		}
	}

	function syncUrl(slugs: string[]) {
		if (!browser) return;
		const params = new URLSearchParams();
		params.set('extensions', serializeExtensionSlugs(ensureOpenquokCoreExtensionSlug(slugs)));
		const nextUrl = `${agentBuilderPath}?${params.toString()}`;
		window.history.replaceState(window.history.state, '', nextUrl);
	}

	function addLibraryItem(itemVm: StackBuilderLibraryItemViewModel) {
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

	function updateStep(stepId: string, patch: Partial<StackBuilderWorkflowStepViewModel>) {
		workflowSteps = workflowSteps.map((step) =>
			step.id === stepId ? ({ ...step, ...patch } as StackBuilderWorkflowStepViewModel) : step
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
				Selected extensions
			</p>
			<div class="flex flex-wrap gap-2">
				{#each extensionsCatalog as extension (extension.id)}
					{@const selected = activeExtensionSlugs.includes(extension.slug)}
					<button
						type="button"
						class="btn btn-sm {selected ? 'btn-primary' : 'btn-outline'}"
						disabled={loadingExtensionSlug === extension.slug}
						onclick={() => void toggleExtensionSlug(extension.slug)}
					>
						{#if selected}
							<span aria-hidden="true">✓</span>
						{/if}
						{extension.title}
					</button>
				{/each}
			</div>
		</div>
	</header>

	<section class="container mx-auto mt-8 max-w-[1600px] px-4">
		<div class="flex flex-col gap-4">
			<div class="overflow-hidden rounded-2xl border border-base-content/10 bg-base-100">
				<StackBuilderLibraryPanel
					itemsVm={libraryItems}
					onAddItem={addLibraryItem}
				/>
			</div>

			<div class="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-3">
				<div class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 lg:col-span-1">
					<StackBuilderWorkflowPanel
						stepsVm={workflowSteps}
						onUpdateStep={updateStep}
						onRemoveStep={removeStep}
						onReorder={reorderSteps}
						onAddTextStep={addTextStep}
					/>
				</div>
				<div class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 lg:col-span-2">
					<StackBuilderPreviewPanel
						bind:markdown={exportMarkdown}
						{downloadFilename}
						onMarkdownEdit={markExportMarkdownEdited}
					/>
				</div>
			</div>
		</div>

		<div class="mt-6">
			<StackBuilderReferenceAssetsPanel
				assetsVm={referenceAssets}
				onChange={(assetsVm) => {
					referenceAssets = assetsVm;
				}}
			/>
		</div>
	</section>
</SectionOuterContainer>
