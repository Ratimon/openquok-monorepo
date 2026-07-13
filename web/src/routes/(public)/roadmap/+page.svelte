<script lang="ts">
	import type { PageData } from './$types';
	import type { RoadmapCategoryId } from '$lib/roadmap/roadmap.types';

	import { page } from '$app/state';
	import { generalFeedbackPresenter } from '$lib/feedbacks';
	import {
		countActiveRoadmapFilters,
		filterRoadmapItems,
		groupRoadmapItemsByColumn
	} from '$lib/roadmap';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import FeedbackDialog from '$lib/ui/components/feedback/FeedbackDialog.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import RoadmapFilters from '$lib/ui/components/roadmap/RoadmapFilters.svelte';
	import RoadmapKanbanBoard from '$lib/ui/components/roadmap/RoadmapKanbanBoard.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let roadmapItems = $derived(data.roadmapItems);
	let roadmapColumns = $derived(data.roadmapColumns);
	let roadmapCategories = $derived(data.roadmapCategories);
	let isLoggedIn = $derived(data.isLoggedIn ?? false);

	let selectedCategoryIds = $state<RoadmapCategoryId[]>([]);

	const filteredItems = $derived(filterRoadmapItems(roadmapItems, selectedCategoryIds));
	const columnsVm = $derived(groupRoadmapItemsByColumn(filteredItems));
	const activeFilterCount = $derived(countActiveRoadmapFilters(selectedCategoryIds));

	let feedbackStatus = $derived(generalFeedbackPresenter.status);
	let feedbackToastMessage = $derived(generalFeedbackPresenter.toastMessage);
	let feedbackPageUrl = $derived(page.url.href);

	function toggleCategory(categoryId: RoadmapCategoryId) {
		if (selectedCategoryIds.includes(categoryId)) {
			selectedCategoryIds = selectedCategoryIds.filter((id) => id !== categoryId);
			return;
		}
		selectedCategoryIds = [...selectedCategoryIds, categoryId];
	}

	function clearFilters() {
		selectedCategoryIds = [];
	}

	async function handleCreateFeedback(
		feedbackType: 'propose' | 'report' | 'feedback',
		url: string,
		description: string,
		email: string
	) {
		return generalFeedbackPresenter.createFeedback(feedbackType, url, description, email);
	}

	function handleResetFeedback() {
		generalFeedbackPresenter.reset();
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<div class="min-w-0">
			<h1 class="text-2xl font-bold tracking-tight text-base-content md:text-3xl">Roadmap</h1>
			<p class="mt-1 max-w-2xl text-sm text-base-content/70">
				Track what we are planning, building, and shipping. Share feedback to help us prioritize.
			</p>
		</div>
		<RoadmapFilters
			categories={roadmapCategories}
			{selectedCategoryIds}
			{activeFilterCount}
			onCategoryToggle={toggleCategory}
			onClearFilters={clearFilters}
		/>
	</header>

	<RoadmapKanbanBoard columns={roadmapColumns} {columnsVm} />
</SectionOuterContainer>

<FeedbackDialog
	status={feedbackStatus}
	feedbackType="propose"
	fixed={true}
	{isLoggedIn}
	toastMessage={feedbackToastMessage}
	feedbackTitle="Propose a feature"
	feedbackDescription="Tell us what you would like to see on the roadmap."
	ModalSuccessMessage="Thanks for the suggestion! We review every proposal."
	url={feedbackPageUrl}
	handleCreateFeedback={handleCreateFeedback}
	handleReset={handleResetFeedback}
/>
