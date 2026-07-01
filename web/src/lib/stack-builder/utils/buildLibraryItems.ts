import type { ExtensionDetailViewModel } from '$lib/listings/GetListing.presenter.svelte';

import { OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/stack-builder/constants/defaults';
import { resolveOpenquokCommandTemplate } from '$lib/stack-builder/constants/openquokCliCommandSnippets';
import type { StackBuilderLibraryItemViewModel } from '$lib/stack-builder/stackBuilder.types';

function libraryItemId(listingSlug: string, kind: 'cli' | 'mcp', name: string): string {
	return `${listingSlug}:${kind}:${name}`;
}

/** Flatten CLI commands and MCP tools from selected extensions into library rows. */
export function buildLibraryItems(
	extensions: ExtensionDetailViewModel[]
): StackBuilderLibraryItemViewModel[] {
	const items: StackBuilderLibraryItemViewModel[] = [];

	for (const extension of extensions) {
		for (const command of extension.skillCommands) {
			const commandTemplate =
				extension.slug === OPENQUOK_CORE_EXTENSION_SLUG
					? resolveOpenquokCommandTemplate(command.name, command.commandTemplate)
					: command.commandTemplate?.trim() || undefined;

			items.push({
				id: libraryItemId(extension.slug, 'cli', command.name),
				listingSlug: extension.slug,
				listingTitle: extension.title,
				extensionType: extension.extensionType,
				kind: 'cli',
				name: command.name,
				description: command.description,
				commandTemplate,
				examplePrompt: command.examplePrompt,
				examplePayload: command.examplePayload
			});
		}

		for (const tool of extension.mcpTools) {
			items.push({
				id: libraryItemId(extension.slug, 'mcp', tool.name),
				listingSlug: extension.slug,
				listingTitle: extension.title,
				extensionType: extension.extensionType,
				kind: 'mcp',
				name: tool.name,
				description: tool.description,
				examplePrompt: `Use the ${tool.name} MCP tool from ${extension.title}.`
			});
		}
	}

	return items.sort((a, b) => {
		const slugCompare = a.listingSlug.localeCompare(b.listingSlug);
		if (slugCompare !== 0) return slugCompare;
		return a.name.localeCompare(b.name);
	});
}
