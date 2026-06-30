import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

export type StackBuilderLibraryItemKind = 'cli' | 'mcp';

/** Clickable command row in the library column. */
export interface StackBuilderLibraryItem {
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

export type StackBuilderWorkflowStep =
	| {
			id: string;
			type: 'command';
			listingSlug: string;
			listingTitle: string;
			commandName: string;
			prompt: string;
			examplePayload?: Record<string, unknown>;
			commandTemplate?: string;
	  }
	| {
			id: string;
			type: 'text';
			content: string;
	  };

export interface StackBuilderReferenceAsset {
	id: string;
	type: 'image' | 'json';
	label: string;
	payload?: string;
	dataUrl?: string;
}

export interface StackBuilderExtensionVm {
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
	extensionsCatalog: StackBuilderExtensionVm[];
	selectedExtensions: ExtensionDetailViewModel[];
	initialWorkflowSteps: StackBuilderWorkflowStep[];
	initialReferenceAssets: StackBuilderReferenceAsset[];
	stackTitle: string | null;
	stackSlug: string | null;
}

export interface ToolsIndexToolCard {
	id: string;
	title: string;
	description: string;
	href: string;
	badge?: string;
}
