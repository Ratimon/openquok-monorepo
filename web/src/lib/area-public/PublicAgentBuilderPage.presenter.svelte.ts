import type { GetListingPresenter } from '$lib/listings/GetListing.presenter.svelte';

import { createDefaultCharacterBriefAsset } from '$lib/stack-builder/constants/defaults';
import type { AgentBuilderPageViewModel } from '$lib/stack-builder/stackBuilder.types';
import {
	blueprintToReferenceAssets,
	blueprintToWorkflowSteps
} from '$lib/stack-builder/utils/blueprintToBuilderState';
import { parseExtensionSlugsFromQuery } from '$lib/stack-builder/utils/parseBuilderQuery';

export class PublicAgentBuilderPagePresenter {
	constructor(private readonly getListingPresenter: GetListingPresenter) {}

	async loadAgentBuilderStateless(params: {
		fetch?: typeof globalThis.fetch;
		extensionSlugsParam?: string | null;
		stackSlug?: string | null;
	}): Promise<AgentBuilderPageViewModel> {
		const selectedExtensionSlugs = parseExtensionSlugsFromQuery(params.extensionSlugsParam);
		const stackSlug = params.stackSlug?.trim() || null;

		const hub = await this.getListingPresenter.loadExtensionsHubStateless({
			fetch: params.fetch,
			limit: 100
		});

		const extensionsCatalog = hub.extensions.map((extension) => ({
			id: extension.id,
			title: extension.title,
			slug: extension.slug,
			extensionType: extension.extensionType,
			logoImageUrl: extension.logoImageUrl,
			isOfficial: extension.isOfficial
		}));

		let stackTitle: string | null = null;
		let stackBlueprint = null;
		const slugSet = new Set(selectedExtensionSlugs);

		if (stackSlug) {
			const stackVm = await this.getListingPresenter.loadPublishedStackBySlugVm(
				stackSlug,
				params.fetch
			);
			if (stackVm) {
				stackTitle = stackVm.title;
				stackBlueprint = stackVm.stackBlueprint;
				for (const member of stackVm.stackMembers) {
					if (member.member?.slug) slugSet.add(member.member.slug);
				}
			}
		}

		const resolvedSlugs = [...slugSet];
		const selectedExtensions = (
			await Promise.all(
				resolvedSlugs.map((slug) =>
					this.getListingPresenter.loadPublishedExtensionBySlugStateless(slug, params.fetch)
				)
			)
		).filter((extension): extension is NonNullable<typeof extension> => extension != null);

		const extensionTitlesBySlug = Object.fromEntries(
			selectedExtensions.map((extension) => [extension.slug, extension.title])
		);

		const blueprintSteps = blueprintToWorkflowSteps(stackBlueprint, extensionTitlesBySlug);
		const blueprintAssets = blueprintToReferenceAssets(stackBlueprint);

		return {
			metaTitle: 'Agent Builder',
			metaDescription:
				'Compose agent workflows from extension CLI commands and MCP tools. Preview and download your stack markdown.',
			selectedExtensionSlugs: resolvedSlugs,
			extensionsCatalog,
			selectedExtensions,
			initialWorkflowSteps: blueprintSteps,
			initialReferenceAssets:
				blueprintAssets.length > 0 ? blueprintAssets : [createDefaultCharacterBriefAsset()],
			stackTitle,
			stackSlug
		};
	}
}
