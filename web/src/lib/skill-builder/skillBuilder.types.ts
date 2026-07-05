import type { IconName } from '$data/icons';
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

export interface SkillBuilderPageViewModel {
	metaTitle: string;
	metaDescription: string;
	selectedBuildingBlockSlugs: string[];
	selectedBuildingBlocks: ExtensionDetailViewModel[];
	initialWorkflowSteps: SkillBuilderWorkflowStepViewModel[];
	stackTitle: string | null;
	stackSlug: string | null;
	/** Set on `/tools/skill-builder/{channelSlug}` programmatic SEO routes. */
	channelSlug?: string | null;
	channelLabel?: string | null;
	cliExamplesPath?: string | null;
}

export interface ToolsIndexToolCardViewModel {
	id: string;
	title: string;
	description: string;
	href: string;
	badge?: string;
}

export type SkillBuilderChannelHubLinkViewModel = {
	slug: string;
	platformLabel: string;
	icon: IconName;
	href: string;
};
