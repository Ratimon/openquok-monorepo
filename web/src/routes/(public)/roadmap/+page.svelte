<script lang="ts">
	import type { PageData } from './$types';
	import type { RoadmapCategoryId } from '$lib/roadmap/roadmap.types';

	import { page } from '$app/state';
	import { publicRoadmapPagePresenter } from '$lib/area-public';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import FeedbackDialog from '$lib/ui/components/feedback/FeedbackDialog.svelte';
	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import RoadmapFilters from '$lib/ui/components/roadmap/RoadmapFilters.svelte';
	import RoadmapKanbanBoard from '$lib/ui/components/roadmap/RoadmapKanbanBoard.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let schemaData = $derived(data.schemaData);
	let roadmapItems = $derived(data.roadmapItems);
	let roadmapColumnOptionsVm = $derived(data.roadmapColumnOptionsVm);
	let roadmapCategories = $derived(data.roadmapCategories);
	let isLoggedIn = $derived(data.isLoggedIn ?? false);

	let selectedCategoryIds = $derived(publicRoadmapPagePresenter.selectedCategoryIds);
	let filteredItems = $derived(publicRoadmapPagePresenter.filterItems(roadmapItems));
	let columnsVm = $derived(publicRoadmapPagePresenter.groupByColumn(filteredItems));
	let activeFilterCount = $derived(publicRoadmapPagePresenter.getActiveFilterCount());

	let feedbackStatus = $derived(publicRoadmapPagePresenter.feedbackStatus);
	let feedbackToastMessage = $derived(publicRoadmapPagePresenter.feedbackToastMessage);
	let feedbackPageUrl = $derived(page.url.href);

	function toggleCategory(categoryId: RoadmapCategoryId) {
		publicRoadmapPagePresenter.toggleCategory(categoryId);
	}

	function clearFilters() {
		publicRoadmapPagePresenter.clearFilters();
	}

	async function handleCreateFeedback(
		feedbackType: 'propose' | 'report' | 'feedback',
		url: string,
		description: string,
		email: string
	) {
		return publicRoadmapPagePresenter.createFeedback(feedbackType, url, description, email);
	}

	function handleResetFeedback() {
		publicRoadmapPagePresenter.resetFeedback();
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

	<RoadmapKanbanBoard
		columnOptionsVm={roadmapColumnOptionsVm ?? []}
		{columnsVm}
	/>
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
