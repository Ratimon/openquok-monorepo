import type { Component } from 'svelte';

import type { ExtensionDetailViewModel } from '$lib/listings/index';

export type ExtensionDetailComponentProps = {
	extensionVm: ExtensionDetailViewModel;
	displayLikes: number;
	onLike: () => void | Promise<void>;
	onExternalClick?: () => void | Promise<void>;
	likeDisabled?: boolean;
};

export type ExtensionDetailComponent = Component<ExtensionDetailComponentProps>;

export function loadExtensionDetailComponent(
	extensionType: ExtensionDetailViewModel['extensionType']
): Promise<{ default: ExtensionDetailComponent }> {
	if (extensionType === 'mcp') {
		return import('$lib/ui/templates/extensions/McpExtensionDetail.svelte');
	}
	if (extensionType === 'both') {
		return import('$lib/ui/templates/extensions/BothExtensionDetail.svelte');
	}
	return import('$lib/ui/templates/extensions/SkillExtensionDetail.svelte');
}
