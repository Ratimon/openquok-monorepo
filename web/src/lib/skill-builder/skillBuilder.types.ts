import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

export type SkillBuilderLibraryItemKind = 'cli' | 'mcp';

/** Clickable command row in the library column. */
export interface SkillBuilderLibraryItemViewModel {
	id: string;
	listingSlug: string;
	listingTitle: string;
	extensionType: string | null;
	kind: SkillBuilderLibraryItemKind;
	name: string;
	description: string;
	commandTemplate?: string;
	examplePrompt?: string;
	examplePayload?: Record<string, unknown>;
}

export type SkillBuilderWorkflowStepViewModel =
	| {
			id: string;
			type: 'command';
			kind: SkillBuilderLibraryItemKind;
			listingSlug: string;
			listingTitle: string;
			commandName: string;
			title?: string;
			prompt: string;
			examplePayload?: Record<string, unknown>;
			commandTemplate?: string;
	  }
	| {
			id: string;
			type: 'text';
			title?: string;
			content: string;
	  };

export interface SkillBuilderBuildingBlockViewModel {
	id: string;
	title: string;
	slug: string;
	extensionType: string | null;
	logoImageUrl: string | null;
	isOfficial: boolean;
}

export interface SkillBuilderPageViewModel {
	metaTitle: string;
	metaDescription: string;
	selectedBuildingBlockSlugs: string[];
	buildingBlocksCatalog: SkillBuilderBuildingBlockViewModel[];
	selectedBuildingBlocks: ExtensionDetailViewModel[];
	initialWorkflowSteps: SkillBuilderWorkflowStepViewModel[];
	stackTitle: string | null;
	stackSlug: string | null;
}

export interface ToolsIndexToolCardViewModel {
	id: string;
	title: string;
	description: string;
	href: string;
	badge?: string;
}
