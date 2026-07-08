import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicPlaybookBySlugPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicCreator,
	getRootPathPublicCreatorPlaybook
} from '$lib/area-public/constants/getRootPathPublicCreators';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { resolveStackListingHeaderSummary } from '$lib/listings/utils/resolveStackListingHeaderSummary';
import { resolveBlueprintWorkflowStepTitle } from '$lib/skill-builder/utils/resolveBlueprintWorkflowStepTitle';

export const ssr = true;

type HowToStep = {
	'@type': 'HowToStep';
	position: number;
	name: string;
	text: string;
};

function resolvePlaybookStepText(step: Record<string, unknown>): string | undefined {
	const content = typeof step.content === 'string' ? step.content.trim() : '';
	if (content) return content;

	const prompt = typeof step.prompt === 'string' ? step.prompt.trim() : '';
	if (prompt) return prompt;

	const examplePayload = step.example_payload;
	if (examplePayload) {
		return JSON.stringify(examplePayload, null, 2);
	}

	return undefined;
}

export async function load({ url, params, cookies, fetch, parent }) {
	const userSlug = params.userSlug;
	const listingSlug = params.listingSlug;
	if (typeof userSlug !== 'string' || !userSlug.trim()) {
		throw error(404, 'Playbook not found');
	}
	if (typeof listingSlug !== 'string' || !listingSlug.trim()) {
		throw error(404, 'Playbook not found');
	}

	const playbookVm = await publicPlaybookBySlugPagePresenter.loadPlaybookBySlugStateless({
		userSlug,
		slug: listingSlug,
		fetch
	});
	if (!playbookVm) {
		throw error(404, 'Playbook not found');
	}

	const comments = await publicPlaybookBySlugPagePresenter.loadListingCommentsStateless({
		listingId: playbookVm.id,
		fetch
	});

	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const customTitle = `${playbookVm.title} | ${companyName}`;
	const customDescription =
		resolveStackListingHeaderSummary(playbookVm) ?? `Playbook details for ${playbookVm.title}.`;

	const ownerUsername = playbookVm.owner?.username?.trim() ?? userSlug;
	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicCreatorPlaybook(ownerUsername, playbookVm.slug),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const ownerName = playbookVm.owner?.fullName?.trim() || playbookVm.owner?.username?.trim() || 'Creator';
	const ownerImage = playbookVm.owner?.avatarUrl?.trim() || undefined;
	const ownerProfileUrl = new URL(`/${getRootPathPublicCreator(ownerUsername)}`, url.origin).href;
	const workflowSteps = playbookVm.stackBlueprint?.workflow_steps ?? [];
	const howToSteps = workflowSteps
		.map<HowToStep | null>((step, index) => {
			const text = resolvePlaybookStepText(step as Record<string, unknown>);
			if (!text) return null;

			return {
				'@type': 'HowToStep',
				position: index + 1,
				name: resolveBlueprintWorkflowStepTitle(step) || `Step ${index + 1}`,
				text
			};
		})
		.filter((step): step is HowToStep => step !== null);
	const howToTools = playbookVm.stackMembers
		.map((member) => member.member?.title?.trim())
		.filter((value): value is string => Boolean(value));
	const referenceSupplies = (playbookVm.stackBlueprint?.reference_assets ?? [])
		.map((asset) => asset.label?.trim())
		.filter((value): value is string => Boolean(value));
	const mainEntityType = howToSteps.length > 0 ? 'HowTo' : 'CreativeWork';
	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: playbookVm.title,
				description: customDescription,
				url: canonical,
				mainEntity: {
					'@id': `${canonical}#main-entity`
				},
				author: {
					'@id': `${canonical}#author`
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			{
				'@type': 'Person',
				'@id': `${canonical}#author`,
				name: ownerName,
				url: ownerProfileUrl,
				image: ownerImage,
				alternateName: ownerUsername ? `@${ownerUsername}` : undefined
			},
			{
				'@type': mainEntityType,
				'@id': `${canonical}#main-entity`,
				name: playbookVm.title,
				description: customDescription,
				url: canonical,
				image: playbookVm.logoImageUrl || undefined,
				author: {
					'@id': `${canonical}#author`
				},
				...(playbookVm.category?.name ? { about: playbookVm.category.name } : {}),
				...(playbookVm.tags.length > 0
					? { keywords: playbookVm.tags.map((tag) => tag.name).join(', ') }
					: {}),
				...(howToTools.length > 0 ? { tool: howToTools } : {}),
				...(referenceSupplies.length > 0 ? { supply: referenceSupplies } : {}),
				...(howToSteps.length > 0 ? { step: howToSteps } : {}),
				mainEntityOfPage: {
					'@id': `${canonical}#webpage`
				}
			}
		]
	};

	return {
		pageMetaTags: metaTags,
		isLoggedIn: !!cookies.get('access_token'),
		playbookVm,
		commentsVm: comments,
		schemaData
	};
}
