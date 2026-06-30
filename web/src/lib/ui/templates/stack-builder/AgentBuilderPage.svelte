<script lang="ts">
	import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';
	import type {
		StackBuilderExtensionVm,
		StackBuilderLibraryItem,
		StackBuilderReferenceAsset,
		StackBuilderWorkflowStep
	} from '$lib/stack-builder/stackBuilder.types';

	import { browser } from '$app/environment';
	import { nanoid } from 'nanoid';

	import { getRootPathPublicAgentBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { getListingPresenter } from '$lib/listings';
	import { buildLibraryItems } from '$lib/stack-builder/utils/buildLibraryItems';
	import { generateStackMarkdown } from '$lib/stack-builder/utils/generateStackMarkdown';
	import { serializeExtensionSlugs } from '$lib/stack-builder/utils/parseBuilderQuery';
	import { route } from '$lib/utils/path';

	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StackBuilderLibraryPanel from '$lib/ui/templates/stack-builder/StackBuilderLibraryPanel.svelte';
	import StackBuilderWorkflowPanel from '$lib/ui/templates/stack-builder/StackBuilderWorkflowPanel.svelte';
	import StackBuilderPreviewPanel from '$lib/ui/templates/stack-builder/StackBuilderPreviewPanel.svelte';
	import StackBuilderReferenceAssetsPanel from '$lib/ui/templates/stack-builder/StackBuilderReferenceAssetsPanel.svelte';

	type Props = {
		metaTitle: string;
		metaDescription: string;
		selectedExtensionSlugs: string[];
		extensionsCatalog: StackBuilderExtensionVm[];
		selectedExtensions: ExtensionDetailViewModel[];
		initialWorkflowSteps: StackBuilderWorkflowStep[];
		initialReferenceAssets: StackBuilderReferenceAsset[];
		stackTitle: string | null;
		stackSlug: string | null;
	};

	let {
		metaTitle,
		metaDescription,
		selectedExtensionSlugs,
		extensionsCatalog,
		selectedExtensions,
		initialWorkflowSteps,
		initialReferenceAssets,
		stackTitle,
		stackSlug
	}: Props = $props();

	const agentBuilderPath = route(getRootPathPublicAgentBuilder());

	const serverHydrationKey = $derived(
		`${selectedExtensionSlugs.join(',')}|${stackSlug ?? ''}|${initialWorkflowSteps.length}|${initialReferenceAssets.length}`
	);

	let hydratedFrom = $state('');

	let activeExtensionSlugs = $state<string[]>([]);
	let extensionDetails = $state<ExtensionDetailViewModel[]>([]);
	let workflowSteps = $state<StackBuilderWorkflowStep[]>([]);
	let referenceAssets = $state<StackBuilderReferenceAsset[]>([]);
	let loadingExtensionSlug = $state<string | null>(null);

	$effect(() => {
		const key = serverHydrationKey;
		if (hydratedFrom === key) return;
		hydratedFrom = key;
		activeExtensionSlugs = [...selectedExtensionSlugs];
		extensionDetails = selectedExtensions.map((extension) => ({ ...extension }));
		workflowSteps = initialWorkflowSteps.map((step) => ({ ...step, id: step.id || nanoid() }));
		referenceAssets = initialReferenceAssets.map((asset) => ({ ...asset }));
	});

	const libraryItems = $derived(buildLibraryItems(extensionDetails));

	const exportTitle = $derived(stackTitle?.trim() || 'Agent workflow stack');

	const generatedMarkdown = $derived(
		generateStackMarkdown({
			title: exportTitle,
			extensionSlugs: activeExtensionSlugs,
			workflowSteps,
			referenceAssets
		})
	);

	let exportMarkdown = $state('');

	$effect(() => {
		exportMarkdown = generatedMarkdown;
	});

	const downloadFilename = $derived(
		stackSlug ? `${stackSlug}-workflow.md` : 'agent-stack.md'
	);

	async function toggleExtensionSlug(slug: string) {
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
		params.set('extensions', serializeExtensionSlugs(slugs));
		const nextUrl = `${agentBuilderPath}?${params.toString()}`;
		window.history.replaceState(window.history.state, '', nextUrl);
	}

	function addLibraryItem(item: StackBuilderLibraryItem) {
		workflowSteps = [
			...workflowSteps,
			{
				id: nanoid(),
				type: 'command',
				listingSlug: item.listingSlug,
				listingTitle: item.listingTitle,
				commandName: item.name,
				prompt: item.examplePrompt ?? item.description,
				examplePayload: item.examplePayload,
				commandTemplate: item.commandTemplate
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

	function updateStep(stepId: string, patch: Partial<StackBuilderWorkflowStep>) {
		workflowSteps = workflowSteps.map((step) =>
			step.id === stepId ? ({ ...step, ...patch } as StackBuilderWorkflowStep) : step
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

<SectionOuterContainer class="py-8 md:py-12">
	<header class="container mx-auto max-w-[1600px] space-y-4 px-4">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Free tool</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{metaTitle}</h1>
		<p class="max-w-3xl text-base text-base-content/70">{metaDescription}</p>

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
		<div class="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-3">
			<div class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100">
				<StackBuilderLibraryPanel items={libraryItems} onAddItem={addLibraryItem} />
			</div>
			<div class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100">
				<StackBuilderWorkflowPanel
					steps={workflowSteps}
					onUpdateStep={updateStep}
					onRemoveStep={removeStep}
					onReorder={reorderSteps}
					onAddTextStep={addTextStep}
				/>
			</div>
			<div class="min-h-[420px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-100">
				<StackBuilderPreviewPanel bind:markdown={exportMarkdown} {downloadFilename} />
			</div>
		</div>

		<div class="mt-6">
			<StackBuilderReferenceAssetsPanel
				assets={referenceAssets}
				onChange={(assets) => {
					referenceAssets = assets;
				}}
			/>
		</div>
	</section>
</SectionOuterContainer>
