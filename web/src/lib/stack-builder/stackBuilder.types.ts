import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

export type StackBuilderLibraryItemKind = 'cli' | 'mcp';

/** Clickable command row in the library column. */
export interface StackBuilderLibraryItemViewModel {
	id: string;
	listingSlug: string;
	listingTitle: string;
	extensionType: string | null;
	kind: StackBuilderLibraryItemKind;
	name: string;
	description: string;
	commandTemplate?: string;
	examplePrompt?: string;
	examplePayload?: Record<string, unknown>;
}

export type StackBuilderWorkflowStepViewModel =
	| {
			id: string;
			type: 'command';
			kind: StackBuilderLibraryItemKind;
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

export interface StackBuilderExtensionViewModel {
	id: string;
	title: string;
	slug: string;
	extensionType: string | null;
	logoImageUrl: string | null;
	isOfficial: boolean;
}

export interface AgentBuilderPageViewModel {
	metaTitle: string;
	metaDescription: string;
	selectedExtensionSlugs: string[];
	extensionsCatalog: StackBuilderExtensionViewModel[];
	selectedExtensions: ExtensionDetailViewModel[];
	initialWorkflowSteps: StackBuilderWorkflowStepViewModel[];
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
