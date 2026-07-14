import type { FeedbackPresenter } from '$lib/feedbacks/Feedback.presenter.svelte';
import {
	ROADMAP_CATEGORIES,
	ROADMAP_COLUMNS,
	ROADMAP_ITEMS,
	countActiveRoadmapFilters,
	filterRoadmapItems,
	groupRoadmapItemsByColumn
} from '$lib/roadmap';
import type {
	RoadmapCategoryId,
	RoadmapCategoryOptionViewModel,
	RoadmapColumnOptionViewModel,
	RoadmapColumnsViewModel,
	RoadmapItemViewModel
} from '$lib/roadmap/roadmap.types';

export type RoadmapHubLoadViewModel = {
	roadmapItems: readonly RoadmapItemViewModel[];
	roadmapColumnOptionsVm: readonly RoadmapColumnOptionViewModel[];
	roadmapCategories: readonly RoadmapCategoryOptionViewModel[];
	metaTitle: string;
	metaDescription: string;
};

const ROADMAP_META_TITLE = 'Roadmap';
const ROADMAP_META_DESCRIPTION =
	'See what we are planning, building, and shipping next for OpenQuok. Share feedback to help us prioritize.';

export class PublicRoadmapPagePresenter {
	selectedCategoryIds = $state<RoadmapCategoryId[]>([]);

	constructor(private readonly feedbackPresenter: FeedbackPresenter) {}

	/** Stateless — safe for `+page.server.ts` (SSR): roadmap catalog → VM without mutating `$state`. */
	loadRoadmapHubStateless(): RoadmapHubLoadViewModel {
		return {
			roadmapItems: ROADMAP_ITEMS,
			roadmapColumnOptionsVm: ROADMAP_COLUMNS,
			roadmapCategories: ROADMAP_CATEGORIES,
			metaTitle: ROADMAP_META_TITLE,
			metaDescription: ROADMAP_META_DESCRIPTION
		};
	}

	filterItems(items: readonly RoadmapItemViewModel[]): RoadmapItemViewModel[] {
		return filterRoadmapItems(items, this.selectedCategoryIds);
	}

	groupByColumn(items: readonly RoadmapItemViewModel[]): RoadmapColumnsViewModel {
		return groupRoadmapItemsByColumn(items);
	}

	getActiveFilterCount(): number {
		return countActiveRoadmapFilters(this.selectedCategoryIds);
	}

	toggleCategory(categoryId: RoadmapCategoryId): void {
		if (this.selectedCategoryIds.includes(categoryId)) {
			this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId);
			return;
		}

		this.selectedCategoryIds = [...this.selectedCategoryIds, categoryId];
	}

	clearFilters(): void {
		this.selectedCategoryIds = [];
	}

	get feedbackStatus() {
		return this.feedbackPresenter.status;
	}

	get feedbackToastMessage() {
		return this.feedbackPresenter.toastMessage;
	}

	async createFeedback(
		feedbackType: 'propose' | 'report' | 'feedback',
		url: string,
		description: string,
		email: string
	) {
		return this.feedbackPresenter.createFeedback(feedbackType, url, description, email);
	}

	resetFeedback(): void {
		this.feedbackPresenter.reset();
	}
}
